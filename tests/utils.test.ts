// deno-lint-ignore-file no-non-null-assertion

import { assert, assertEquals, assertThrows } from '$std/testing/asserts.ts';

import {
  // assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import utils from '../src/utils.ts';

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

      assertEquals(rng, { value: 'b', chance: 70 });

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

Deno.test('parse int', () => {
  const id = '84824280';
  const notId = 'abc' + id;

  assertEquals(utils.parseInt(id)!, 84824280);
  assertEquals(utils.parseInt(notId)!, undefined);
});

Deno.test('decode description', async (test) => {
  await test.step('decode simple html', () => {
    assertEquals(utils.decodeDescription('&amp;'), '&');
    assertEquals(utils.decodeDescription('&quot;'), '"');
    assertEquals(utils.decodeDescription('&apos;'), '\'');
    assertEquals(utils.decodeDescription('&rsquo;'), '\'');
    assertEquals(utils.decodeDescription('&#039;'), '\'');
    assertEquals(utils.decodeDescription('&lt;'), '<');
    assertEquals(utils.decodeDescription('&gt;'), '>');
    assertEquals(utils.decodeDescription('&mdash;'), '-');
  });

  await test.step('strip urls', () => {
    assertEquals(
      utils.decodeDescription('<a href="https://goolge/com/page">page</a>'),
      '[page](https://goolge/com/page)',
    );

    assertEquals(
      utils.decodeDescription('<a href="https://goolge/com/page">pa\n\nge</a>'),
      '[pa\n\nge](https://goolge/com/page)',
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
  });

  await test.step('transform html to markdown', () => {
    assertEquals(utils.decodeDescription('<i>abc</i>'), '*abc*');
    assertEquals(utils.decodeDescription('<i> a\nbc  \n <i>'), '*a\nbc*');
    assertEquals(utils.decodeDescription('<b>abc</b>'), '**abc**');
    assertEquals(utils.decodeDescription('<b>ab\nc \n  <b>'), '**ab\nc**');
    assertEquals(utils.decodeDescription('<strike>abc</strike>'), '~~abc~~');
    assertEquals(utils.decodeDescription('<strike>   abc<strike>'), '~~abc~~');
    assertEquals(utils.decodeDescription('<br></br><br/>'), '\n\n\n');
    assertEquals(utils.decodeDescription('<hr></hr><hr/>'), '\n\n\n');
  });

  await test.step('remove certain tags', () => {
    assertEquals(utils.decodeDescription('~!abc!~'), '');
    assertEquals(utils.decodeDescription('~!a\n\nbc!~'), '');
    assertEquals(utils.decodeDescription('||abc||'), '');
    assertEquals(utils.decodeDescription('||a\nb\nc||'), '');
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

// Deno.test('external images', async (test) => {
//   await test.step('image/jpeg', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/jpeg',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpg')
//         }`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/jpeg');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<450x635>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('image/png', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/png',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.png'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.png')
//         }`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.png'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<450x635>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('image/gif', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/gif',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.gif'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.gif')
//         }`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.gif'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<230x325>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('image/jpeg (preview)', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/jpeg',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpg')
//         }?size=preview`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/jpeg');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<32x32>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('image/jpeg (thumbnail)', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/jpeg',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpg')
//         }?size=thumbnail`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/jpeg');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<110x155>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('image/jpeg (blur)', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/jpeg',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpg')
//         }?blur`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<230x325>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('image/jpeg (medium)', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'image/jpeg',
//         }),
//         arrayBuffer: () => Deno.readFile('tests/images/test.jpeg'),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpg')
//         }?size=medium`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/jpeg');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<230x325>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('invalid thumbnail', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'application/json',
//         }),
//         arrayBuffer: () => new TextEncoder().encode('data'),
//       } as any),
//     );

//     config.origin = 'http://localhost:8000';

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpeg')
//         }?size=thumbnail`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);
//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpeg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<110x155>');
//     } finally {
//       delete config.origin;
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('invalid type', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           'Content-Type': 'application/json',
//         }),
//         arrayBuffer: () => new TextEncoder().encode('data'),
//       } as any),
//     );

//     config.origin = 'http://localhost:8000';

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.jpeg')
//         }`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);
//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.jpeg'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<230x325>');
//     } finally {
//       delete config.origin;
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('over 10 mib', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => ({
//         status: 200,
//         headers: new Headers({
//           // 11 Mib
//           'Content-Length': `${1024 * 1024 * 11}`,
//           'Content-Type': 'image/png',
//         }),
//       } as any),
//     );

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/${
//           encodeURIComponent('https://example.com/image.png')
//         }`,
//       } as any);

//       assertSpyCalls(fetchStub, 1);

//       assertSpyCall(fetchStub, 0, {
//         args: [new URL('https://example.com/image.png'), {
//           signal: 'timeout' as any,
//         }],
//       });

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<230x325>');
//     } finally {
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });

//   await test.step('empty url', async () => {
//     const abortStub = stub(AbortSignal, 'timeout', () => 'timeout' as any);

//     const fetchStub = stub(
//       globalThis,
//       'fetch',
//       () => undefined as any,
//     );

//     config.origin = 'http://localhost:8000';

//     try {
//       const response = await utils.proxy({
//         url: `http://localhost:8000/external/`,
//       } as any);

//       assertSpyCalls(fetchStub, 0);

//       assertEquals(response.status, 200);

//       assertEquals(response.headers.get('Content-Type'), 'image/png');

//       assertEquals(
//         response.headers.get('Cache-Control'),
//         'public, max-age=604800',
//       );

//       const image = await imagescript.decode(await response.arrayBuffer());

//       assert(image instanceof imagescript.Image);

//       assertEquals(`${image}`, 'Image<230x325>');
//     } finally {
//       delete config.origin;
//       abortStub.restore();
//       fetchStub.restore();
//     }
//   });
// });

Deno.test('recharge timestamps', () => {
  const now = new Date();

  const expected = new Date().setMinutes(now.getMinutes() + 5).toString();

  assertEquals(
    utils.rechargeTimestamp(now.toISOString()),
    expected.substring(0, expected.length - 3),
  );
});

Deno.test('voting timestamps', async (test) => {
  await test.step('cannot vote', () => {
    const now = new Date();

    const expected = new Date().setHours(now.getHours() + 12).toString();

    const _ = utils.votingTimestamp(now.toISOString());

    assertEquals(
      _.timeLeft,
      expected.substring(0, expected.length - 3),
    );

    assertEquals(
      _.canVote,
      false,
    );
  });

  await test.step('can vote', () => {
    const past = new Date();

    past.setHours(new Date().getHours() - 12).toString();

    const _ = utils.votingTimestamp(past.toISOString());

    assertEquals(
      _.canVote,
      true,
    );
  });
});

Deno.test('diff days', async (test) => {
  await test.step('23 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 23);

    assertEquals(utils.diffInDays(a, b), 0);
  });

  await test.step('24 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 24);

    assertEquals(utils.diffInDays(a, b), 1);
  });

  await test.step('47 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 47);

    assertEquals(utils.diffInDays(a, b), 1);
  });

  await test.step('48 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 48);

    assertEquals(utils.diffInDays(a, b), 2);
  });
});

Deno.test('cipher', () => {
  const token =
    'aW50ZXJhY3Rpb246MTA4NTI3MDUzMTA1OTc2NTI5ODowZGgxelpMVVBOZmxFcGFDOE9xc3V5RDdaQmdTUzlZT3Q1dzk0c250cVpoNDlheXJUSHFacjEzNjV2a28xMVFvbG9qOGRMRVVFWWtuQTNGaWVzbVY3ZGR0aTJIQ3plYUQ5em0xa2p3Sm5CU0w4cWNmWjlndlc4RWdsamJ0dFl2TQ';

  const encrypted = utils.cipher(token, 123);

  assertEquals(
    encrypted,
    '3NKwq9XTxePUrs3r3a2vscjPvK_Jz8SuyL_Q9cjPvKzKz96tyc_EsMq_6vLVwuLz4OfryNHRvcrV6PPB3sLBv8rAtPPertGwzb_f3Mzo38_Q9efVz67MrN_15qverbCr3tHr6sm_5-Pg08XQzsPB3N7lwPXJ5dGt3K2z88jRwfHdwrTsysLNyM3R0cHS0u_wzM_JwtzS0fXd0dSu1cLNq9zPxcTMruvn1NDMsODoq_PcreuuzuiwvtCr8q_e0sno0uXn6d_n3q_N0t_u3OjFq9_B563PzA==',
  );

  const decrypted = utils.decipher(encrypted, 123);

  assertEquals(decrypted, token);
});
