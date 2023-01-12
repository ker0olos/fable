import {
  assert,
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import utils from '../src/utils.ts';

import type { Image, Media } from '../src/types.ts';

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
    assertEquals(utils.decodeDescription('<b>abc</b>'), '**abc**');
    assertEquals(utils.decodeDescription('<strike>abc</strike>'), '~~abc~~');
    assertEquals(utils.decodeDescription('<br></br><br/>'), '\n\n\n');
    assertEquals(utils.decodeDescription('<hr></hr>'), '\n\n');

    assertEquals(
      utils.decodeDescription('<a href="url">abc</a>'),
      '[abc](url)',
    );
  });

  await test.step('remove certain tags', () => {
    assertEquals(utils.decodeDescription('~!abc!~'), '');
  });
});

Deno.test('titles to array', async (test) => {
  await test.step('all titles', () => {
    const media = {
      title: {
        romaji: 'romaji',
        native: 'native',
        english: 'english',
      },
    };

    const array = utils.titlesToArray(media as Media);

    assertEquals(array, [
      'english',
      'romaji',
      'native',
    ]);
  });

  await test.step('missing 1 title', () => {
    const media = {
      title: {
        romaji: '',
        native: 'native',
        english: 'english',
      },
    };

    const array = utils.titlesToArray(media as Media);

    assertEquals(array, [
      'english',
      'native',
    ]);
  });
});

Deno.test('images to array', async (test) => {
  await test.step('all images', () => {
    const image: Image = {
      extraLarge: 'extraLarge',
      large: 'large',
      medium: 'medium',
    };

    const array = utils.imagesToArray(image, 'large-first');

    assertEquals(array, [
      'extraLarge',
      'large',
      'medium',
    ]);
  });

  await test.step('all images in reverse order', () => {
    const image: Image = {
      extraLarge: 'extraLarge',
      large: 'large',
      medium: 'medium',
    };

    const array = utils.imagesToArray(image, 'small-first');

    assertEquals(array, [
      'medium',
      'large',
      'extraLarge',
    ]);
  });

  await test.step('select ideal size', () => {
    const image: Image = {
      extraLarge: 'extraLarge',
      large: 'large',
      medium: 'medium',
    };

    const array = utils.imagesToArray(image, 'large-first', 'large');

    assertEquals(array, [
      'large',
    ]);
  });

  await test.step('missing 1 image', () => {
    const image: Image = {
      extraLarge: 'extraLarge',
      medium: 'medium',
    };

    const array = utils.imagesToArray(image, 'large-first');

    assertEquals(array, [
      'extraLarge',
      'medium',
    ]);
  });

  await test.step('missing ideal image', () => {
    const image: Image = {
      extraLarge: 'extraLarge',
      medium: 'medium',
    };

    const array = utils.imagesToArray(image, 'large-first', 'large');

    assertEquals(array, [
      'extraLarge',
      'medium',
    ]);
  });

  await test.step('missing all images', () => {
    const image: Image = {};

    const array = utils.imagesToArray(image, 'large-first');

    assertEquals(array, []);
  });
});

Deno.test('parse github urls', async (test) => {
  await test.step('name', () => {
    const url = 'owner/repo';

    assertEquals(utils.github(url), {
      owner: 'owner',
      name: 'repo',
    });
  });

  await test.step('url', () => {
    const url = 'https://github.com/owner/repo.git';

    assertEquals(utils.github(url), {
      owner: 'owner',
      name: 'repo',
    });
  });

  await test.step('url with no .git', () => {
    const url = 'https://github.com/owner/repo';

    assertEquals(utils.github(url), {
      owner: 'owner',
      name: 'repo',
    });
  });

  await test.step('invalid name', () => {
    const url = 'owner/name%83';
    assertThrows(
      () => utils.github(url),
      Error,
      'invalid git url: owner/name%83',
    );
  });

  await test.step('invalid url', () => {
    const url = 'url';
    assertThrows(() => utils.github(url), Error, 'invalid git url: url');
  });

  await test.step('invalid hostname', () => {
    const url = 'https://gitlab.com/owner/repo.git';
    assertThrows(
      () => utils.github(url),
      Error,
      'invalid git url: https://gitlab.com/owner/repo.git',
    );
  });

  await test.step('invalid protocol', () => {
    const url = 'git@github.com:owner/repo.git';
    assertThrows(
      () => utils.github(url),
      Error,
      'invalid git url: git@github.com:owner/repo.git',
    );
  });
});
