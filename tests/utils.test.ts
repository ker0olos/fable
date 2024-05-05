// deno-lint-ignore-file no-non-null-assertion
import { stripAnsiCode } from '$std/fmt/colors.ts';

import { assert, assertEquals, assertThrows } from '$std/assert/mod.ts';

import {
  // assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';
import { assertSnapshot, createAssertSnapshot } from '$std/testing/snapshot.ts';

import utils from '~/src/utils.ts';

export const assertMonochromeSnapshot = createAssertSnapshot<string>(
  { serializer: (obj) => stripAnsiCode(JSON.stringify(obj, undefined, 2)) },
  assertSnapshot,
);

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

    await test.step("fail if doesn't sum up to 100", () => {
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

  await test.step('normal 2', () => {
    const text = 'i am a fox';

    const wrap = utils.capitalize(text);

    assertEquals(wrap, 'I Am A Fox');
  });

  await test.step('3 letters', () => {
    const text = 'ona';

    const wrap = utils.capitalize(text);

    assertEquals(wrap, 'ONA');
  });

  await test.step('white space', () => {
    const text = '     ';

    const wrap = utils.capitalize(text);

    assertEquals(wrap, '');
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
    assertEquals(utils.decodeDescription('&apos;'), "'");
    assertEquals(utils.decodeDescription('&rsquo;'), "'");
    assertEquals(utils.decodeDescription('&#039;'), "'");
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
      utils.decodeDescription("<a href='https://goolge/com/page'>page</a>"),
      '[page](https://goolge/com/page)',
    );

    assertEquals(
      utils.decodeDescription("<a href='https://goolge/com/page'>page<a>"),
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

Deno.test('normal timestamps', () => {
  const now = new Date();

  const expected = new Date().getTime().toString();

  assertEquals(
    utils.normalTimestamp(now),
    expected.substring(0, expected.length - 3),
  );
});

Deno.test('recharge timestamps', () => {
  const now = new Date();

  const expected = new Date().setMinutes(now.getMinutes() + 30).toString();

  assertEquals(
    utils.rechargeTimestamp(now),
    expected.substring(0, expected.length - 3),
  );
});

Deno.test('recharge keys timestamps', () => {
  const now = new Date();

  const expected = new Date().setMinutes(now.getMinutes() + 10).toString();

  assertEquals(
    utils.rechargeKeysTimestamp(now),
    expected.substring(0, expected.length - 3),
  );
});

Deno.test('recharge daily tokens timestamps', () => {
  const now = new Date();

  const expected = new Date().setHours(now.getHours() + 12).toString();

  assertEquals(
    utils.rechargeDailyTimestamp(now),
    expected.substring(0, expected.length - 3),
  );
});

Deno.test('reset steal timestamp', () => {
  const now = new Date();

  const expected = new Date().setDate(now.getDate() + 3).toString();

  assertEquals(
    utils.rechargeStealTimestamp(now),
    expected.substring(0, expected.length - 3),
  );
});

Deno.test('diff days', async (test) => {
  await test.step('23 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 23);

    assertEquals(utils.diffInDays(a, b), 0);
  });

  await test.step('25 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 25);

    assertEquals(utils.diffInDays(a, b), 1);
  });

  await test.step('47 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 47);

    assertEquals(utils.diffInDays(a, b), 1);
  });

  await test.step('49 hours', () => {
    const a = new Date();
    const b = new Date();

    b.setHours(b.getHours() - 49);

    assertEquals(utils.diffInDays(a, b), 2);
  });
});

Deno.test('diff mins', async (test) => {
  await test.step('30 mins', () => {
    const a = new Date();
    const b = new Date();

    b.setMinutes(b.getMinutes() - 30);

    assertEquals(utils.diffInMinutes(a, b), 30);
  });
});

Deno.test('is within last 14 days', () => {
  const now = new Date();

  const thirteenDaysAgo = new Date();
  thirteenDaysAgo.setDate(now.getDate() - 13);

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(now.getDate() - 15);

  assertEquals(utils.isWithin14Days(now), true);

  assertEquals(utils.isWithin14Days(thirteenDaysAgo), true);
  assertEquals(utils.isWithin14Days(fifteenDaysAgo), false);
});

Deno.test('distance', () => {
  assertEquals(utils.distance('AQUA', 'aqua'), 100);

  assertEquals(utils.distance('cat', 'cow'), 66.66666666666666);
});

Deno.test('pagination', async (test) => {
  await test.step('default limit', () => {
    const url = new URL('http://localhost:8000?offset=2');

    const pages = utils.pagination(
      url,
      Array(10).fill({}).map((_, i) => `item-${i + 1}`),
      'data',
    );

    assertEquals(pages.data.length, 8);
    assertEquals(pages.length, 10);
    assertEquals(pages.limit, 20);
    assertEquals(pages.offset, 2);

    assertEquals(pages.data[0], 'item-3');
    assertEquals(pages.data[1], 'item-4');
    assertEquals(pages.data[2], 'item-5');
  });

  await test.step('custom limit', () => {
    const url = new URL('http://localhost:8000?limit=3&offset=2');

    const pages = utils.pagination(
      url,
      Array(10).fill({}).map((_, i) => `item-${i + 1}`),
      'data',
    );

    assertEquals(pages.data.length, 3);
    assertEquals(pages.length, 10);
    assertEquals(pages.limit, 3);
    assertEquals(pages.offset, 2);

    assertEquals(pages.data[0], 'item-3');
    assertEquals(pages.data[1], 'item-4');
    assertEquals(pages.data[2], 'item-5');
  });

  await test.step('limit equal to the length of data', () => {
    const url = new URL('http://localhost:8000?limit=10&offset=0');

    const pages = utils.pagination(
      url,
      Array(10).fill({}).map((_, i) => `item-${i + 1}`),
      'data',
    );

    assertEquals(pages.data.length, 10);
    assertEquals(pages.length, 10);
    assertEquals(pages.limit, 10);
    assertEquals(pages.offset, 0);

    assertEquals(pages.data[0], 'item-1');
    assertEquals(pages.data[1], 'item-2');
    assertEquals(pages.data[2], 'item-3');
    assertEquals(pages.data[9], 'item-10');
  });

  await test.step('offset is higher than length of data', () => {
    const url = new URL('http://localhost:8000?limit=10&offset=11');

    const pages = utils.pagination(
      url,
      Array(10).fill({}).map((_, i) => `item-${i + 1}`),
      'data',
    );

    assertEquals(pages.data.length, 0);
    assertEquals(pages.length, 10);
    assertEquals(pages.limit, 10);
    assertEquals(pages.offset, 11);
  });
});
