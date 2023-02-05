// deno-lint-ignore-file no-non-null-assertion

import {
  assert,
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.175.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.175.0/testing/mock.ts';

import * as imagescript from 'https://deno.land/x/imagescript@1.2.15/mod.ts';

import utils from '../src/utils.ts';
import config from '../src/config.ts';

Deno.test('random int in range', () => {
  const randomStub = stub(Math, 'random', returnsNext([0, 0.55, 0.999]));

  try {
    assertEquals(utils.randint(1, 5), 1);
    assertEquals(utils.randint(1, 5), 3);
    assertEquals(utils.randint(1, 5), 5);

    assertSpyCalls(randomStub, 3);
  } finally {
    randomStub.restore();
  }
});

Deno.test('color hex to color int', () => {
  assertEquals(utils.hexToInt('#3E5F8A'), 4087690);
});

Deno.test('shuffle array', () => {
  const randomStub = stub(Math, 'random', returnsNext([0.42, 0.2, 0.8]));

  try {
    const array = ['a', 'b', 'c'];

    utils.shuffle(array);

    assertEquals(array, ['b', 'a', 'c']);
  } finally {
    randomStub.restore();
  }
});

Deno.test('rng with percentages', async (test) => {
  const randomStub = stub(Math, 'random', returnsNext(Array(100).fill(0)));

  try {
    await test.step('normal', () => {
      const rng = utils.rng({
        10: 'a',
        70: 'b',
        20: 'c',
      });

      assertEquals(rng, 'b');

      assertSpyCalls(randomStub, 100);
    });

    await test.step('fail if doesn\'t sum up to 100', () => {
      assertThrows(
        () =>
          utils.rng({
            50: 'fail',
            55: 'fail',
          }),
        Error,
        'Sum of 50,55 is 105 when it should be 100',
      );
    });
  } finally {
    randomStub.restore();
  }
});

Deno.test('truncate', async (test) => {
  await test.step('normal', () => {
    const maxLength = 50;

    const short = utils.truncate('-'.repeat(20), maxLength);

    assertEquals(short!.length, 20);

    const long = utils.truncate('-'.repeat(100), maxLength);

    assertEquals(long!.length, maxLength);

    assert(long!.endsWith('...'));
  });

  await test.step('word split', () => {
    const text =
      'Sit aute ad sunt mollit in aliqua consectetur tempor duis adipisicing id velit et. Quis nostrud excepteur in exercitation.';

    const truncate = utils.truncate(text, 20);

    assert(truncate!.length < 20);

    assertEquals(truncate, 'Sit aute ad sunt...');
  });
});

Deno.test('word wrap', () => {
  const text =
    'Sit aute ad sunt mollit in aliqua consectetur tempor duis adipisicing id velit et. Quis nostrud excepteur in exercitation.';

  const wrap = utils.wrap(text, 20);

  assertEquals(
    wrap,
    [
      'Sit aute ad sunt',
      'mollit in aliqua',
      'consectetur tempor',
      'duis adipisicing id',
      'velit et. Quis',
      'nostrud excepteur in',
      'exercitation.',
    ].join('\n'),
  );
});

Deno.test('capitalize', async (test) => {
  await test.step('normal', () => {
    const text = 'Sit_aute_ad_sunt_mollit';

    const wrap = utils.capitalize(text);

    assertEquals(wrap, 'Sit Aute Ad Sunt Mollit');
  });

  await test.step('3 letters', () => {
    const text = 'ona';

    const wrap = utils.capitalize(text);

    assertEquals(wrap, 'ONA');
  });
});

Deno.test('comma', () => {
  const number = 1_00_0_000_00;

  const wrap = utils.comma(number);

  assertEquals(wrap, '100,000,000');
});

Deno.test('is id a number?', () => {
  const id = '84824280';
  const notId = 'abc' + id;

  assertEquals(utils.parseId(id)!, 84824280);
  assertEquals(utils.parseId(notId)!, undefined);
});

Deno.test('decode description', async (test) => {
  await test.step('decode urls', () => {
    assertEquals(utils.decodeDescription('%20'), ' ');
  });

  await test.step('decode simple html', () => {
    assertEquals(utils.decodeDescription('&amp;'), '&');
    assertEquals(utils.decodeDescription('&quot;'), '"');
    assertEquals(utils.decodeDescription('&apos;'), '\'');
    assertEquals(utils.decodeDescription('&#039;'), '\'');
    assertEquals(utils.decodeDescription('&lt;'), '<');
    assertEquals(utils.decodeDescription('&gt;'), '>');
  });

  await test.step('strip urls', () => {
    assertEquals(
      utils.decodeDescription('<a href="https://goolge/com/page">page</a>'),
      '[page](https://goolge/com/page)',
    );

    assertEquals(
      utils.decodeDescription('<a href=\'https://goolge/com/page\'>page</a>'),
      '[page](https://goolge/com/page)',
    );

    assertEquals(
      utils.decodeDescription('<a href=\'https://goolge/com/page\'>page<a>'),
      '[page](https://goolge/com/page)',
    );

    assertEquals(
      utils.decodeDescription('[page](https://goolge/com/page)'),
      '[page](https://goolge/com/page)',
    );
  });

  await test.step('decode complicated html', () => {
    assertEquals(utils.decodeDescription('&amp;quot;'), '&quot;');
    assertEquals(
      utils.decodeDescription(
        'http://www.example.com/string%20with%20+%20and%20?%20and%20&%20and%20spaces',
      ),
      'http://www.example.com/string with + and ? and & and spaces',
    );
  });

  await test.step('transform html to markdown', () => {
    assertEquals(utils.decodeDescription('<i>abc</i>'), '*abc*');
    assertEquals(utils.decodeDescription('<i> abc <i>'), '*abc*');
    assertEquals(utils.decodeDescription('<b>abc</b>'), '**abc**');
    assertEquals(utils.decodeDescription('<b>abc   <b>'), '**abc**');
    assertEquals(utils.decodeDescription('<strike>abc</strike>'), '~~abc~~');
    assertEquals(utils.decodeDescription('<strike>   abc<strike>'), '~~abc~~');
    assertEquals(utils.decodeDescription('<br></br><br/>'), '\n\n\n');
    assertEquals(utils.decodeDescription('<hr></hr><hr/>'), '\n\n\n');
  });

  await test.step('remove certain tags', () => {
    assertEquals(utils.decodeDescription('~!abc!~'), '');
    assertEquals(utils.decodeDescription('||abc||'), '');
  });
});

Deno.test('read json', async () => {
  const readTextStub = stub(
    Deno,
    'readTextFile',
    () => Promise.resolve('{"data": "abc"}'),
  );

  try {
    const data = await utils.readJson('');

    assertEquals(data, {
      data: 'abc',
    });
  } finally {
    readTextStub.restore();
  }
});

Deno.test('external images', async (test) => {
  await test.step('image/jpeg', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/jpeg',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.jpg')
        }`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.jpg')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/png');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.Image);

      assertEquals(`${image}`, 'Image<450x635>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('image/png', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/png',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.png'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.png')
        }`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.png')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/png');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.Image);

      assertEquals(`${image}`, 'Image<450x635>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('image/gif', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/gif',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.gif'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.gif')
        }`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.gif')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/gif');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.GIF);

      assertEquals(`${image}`, 'GIF<450x450x1000ms>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('invalid image/gif', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/gif',
        }),
        arrayBuffer: () => new TextEncoder().encode('data'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.origin = 'http://localhost:8000';

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image')
        }`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image')],
      });

      assertEquals(response.status, 302);

      assertEquals(
        response.headers.get('location'),
        'http://localhost:8000/assets/medium.png',
      );
    } finally {
      delete config.origin;
      fetchStub.restore();
    }
  });

  await test.step('image/jpeg (thumbnail)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/jpeg',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.jpg')
        }?size=thumbnail`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.jpg')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/png');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.Image);

      assertEquals(`${image}`, 'Image<110x155>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('image/jpeg (medium)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/jpeg',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.jpg')
        }?size=medium`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.jpg')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/png');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.Image);

      assertEquals(`${image}`, 'Image<230x325>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('image/gif (thumbnail)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/gif',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.gif'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.gif')
        }?size=thumbnail`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.gif')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/gif');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.GIF);

      assertEquals(`${image}`, 'GIF<110x110x1000ms>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('image/gif (medium)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'image/gif',
        }),
        arrayBuffer: () => Deno.readFile('tests/images/test.gif'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.gif')
        }?size=medium`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.gif')],
      });

      assertEquals(response.status, 200);

      assertEquals(response.headers.get('Content-Type'), 'image/gif');

      assertEquals(
        response.headers.get('Cache-Control'),
        'public, max-age=604800',
      );

      const image = await imagescript.decode(await response.arrayBuffer());

      assert(image instanceof imagescript.GIF);

      assertEquals(`${image}`, 'GIF<230x230x1000ms>');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('invalid thumbnail', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        arrayBuffer: () => new TextEncoder().encode('data'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.origin = 'http://localhost:8000';

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.jpeg')
        }?size=thumbnail`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.jpeg')],
      });

      assertEquals(response.status, 302);

      assertEquals(
        response.headers.get('location'),
        'http://localhost:8000/assets/thumbnail.png',
      );
    } finally {
      delete config.origin;
      fetchStub.restore();
    }
  });

  await test.step('invalid type', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        arrayBuffer: () => new TextEncoder().encode('data'),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.origin = 'http://localhost:8000';

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/${
          encodeURIComponent('https://example.com/image.jpeg')
        }`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: [new URL('https://example.com/image.jpeg')],
      });

      assertEquals(response.status, 302);

      assertEquals(
        response.headers.get('location'),
        'http://localhost:8000/assets/medium.png',
      );
    } finally {
      delete config.origin;
      fetchStub.restore();
    }
  });

  await test.step('empty url', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      // deno-lint-ignore no-explicit-any
      () => undefined as any,
    );

    config.origin = 'http://localhost:8000';

    try {
      const response = await utils.proxy({
        url: `http://localhost:8000/external/`,
        // deno-lint-ignore no-explicit-any
      } as any);

      assertSpyCalls(fetchStub, 0);

      assertEquals(response.status, 302);

      assertEquals(
        response.headers.get('location'),
        'http://localhost:8000/assets/medium.png',
      );
    } finally {
      delete config.origin;
      fetchStub.restore();
    }
  });
});

Deno.test('text images', async (test) => {
  await test.step('5', async () => {
    // deno-lint-ignore no-explicit-any
    const response = await utils.text({} as any, {} as any, {
      text: '5',
      // deno-lint-ignore no-explicit-any
    } as any);

    assertEquals(response.status, 200);

    assertEquals(response.headers.get('Content-Type'), 'image/png');

    assertEquals(
      response.headers.get('Cache-Control'),
      'public, max-age=604800',
    );

    const image = await imagescript.decode(await response.arrayBuffer());

    assert(image instanceof imagescript.Image);

    assertEquals(`${image}`, 'Image<15x39>');
  });

  await test.step('?', async () => {
    // deno-lint-ignore no-explicit-any
    const response = await utils.text({} as any, {} as any, {
      // deno-lint-ignore no-explicit-any
    } as any);

    assertEquals(response.status, 200);

    assertEquals(response.headers.get('Content-Type'), 'image/png');

    assertEquals(
      response.headers.get('Cache-Control'),
      'public, max-age=604800',
    );

    const image = await imagescript.decode(await response.arrayBuffer());

    assert(image instanceof imagescript.Image);

    assertEquals(`${image}`, 'Image<13x39>');
  });
});
