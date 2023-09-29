// deno-lint-ignore-file no-non-null-assertion

import { assert, assertEquals, assertThrows } from '$std/assert/mod.ts';

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

Deno.test('recharge timestamps', () => {
  const now = new Date();

  const expected = new Date().setMinutes(now.getMinutes() + 30).toString();

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

Deno.test('diff mins', async (test) => {
  await test.step('30 mins', () => {
    const a = new Date();
    const b = new Date();

    b.setMinutes(b.getMinutes() - 30);

    assertEquals(utils.diffInMinutes(a, b), 30);
  });
});
