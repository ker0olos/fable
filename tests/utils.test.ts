import { describe, test, expect, vi, afterEach } from 'vitest';

import utils from '~/src/utils.ts';

describe('utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('color hex to color int', () => {
    expect(utils.hexToInt('#3E5F8A')).toBe(4087690);
  });

  test('shuffle array', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.42)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.8);

    const array = ['a', 'b', 'c'];
    utils.shuffle(array);
    expect(array).toEqual(['b', 'a', 'c']);
  });

  describe('rng with percentages', () => {
    test('normal', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const rng = utils.rng({
        10: 'a',
        70: 'b',
        20: 'c',
      });

      expect(rng).toEqual({ value: 'b', chance: 70 });
      expect(Math.random).toHaveBeenCalledTimes(100);
    });

    test("fail if doesn't sum up to 100", () => {
      expect(() =>
        utils.rng({
          50: 'fail',
          55: 'fail',
        })
      ).toThrow('Sum of 50,55 is 105 when it should be 100');
    });
  });

  describe('truncate', () => {
    test('normal', () => {
      const maxLength = 50;
      const short = utils.truncate('-'.repeat(20), maxLength);
      expect(short!.length).toBe(20);

      const long = utils.truncate('-'.repeat(100), maxLength);
      expect(long!.length).toBe(maxLength);
      expect(long!.endsWith('...')).toBe(true);
    });

    test('word split', () => {
      const text =
        'Sit aute ad sunt mollit in aliqua consectetur tempor duis adipisicing id velit et. Quis nostrud excepteur in exercitation.';

      const truncate = utils.truncate(text, 20);
      expect(truncate!.length).toBeLessThan(20);
      expect(truncate).toBe('Sit aute ad sunt...');
    });
  });

  test('word wrap', () => {
    const text =
      'Sit aute ad sunt mollit in aliqua consectetur tempor duis adipisicing id velit et. Quis nostrud excepteur in exercitation.';

    const wrap = utils.wrap(text, 20);

    expect(wrap).toBe(
      [
        'Sit aute ad sunt',
        'mollit in aliqua',
        'consectetur tempor',
        'duis adipisicing id',
        'velit et. Quis',
        'nostrud excepteur in',
        'exercitation.',
      ].join('\n')
    );
  });

  describe('capitalize', () => {
    test('normal', () => {
      const text = 'Sit_aute_ad_sunt_mollit';
      const wrap = utils.capitalize(text);
      expect(wrap).toBe('Sit Aute Ad Sunt Mollit');
    });

    test('normal 2', () => {
      const text = 'i am a fox';
      const wrap = utils.capitalize(text);
      expect(wrap).toBe('I Am A Fox');
    });

    test('3 letters', () => {
      const text = 'ona';
      const wrap = utils.capitalize(text);
      expect(wrap).toBe('ONA');
    });

    test('white space', () => {
      const text = '     ';
      const wrap = utils.capitalize(text);
      expect(wrap).toBe('');
    });
  });

  test('comma', () => {
    const number = 1_00_0_000_00;
    const wrap = utils.comma(number);
    expect(wrap).toBe('100,000,000');
  });

  test('parse int', () => {
    const id = '84824280';
    const notId = 'abc' + id;

    expect(utils.parseInt(id)!).toBe(84824280);
    expect(utils.parseInt(notId)!).toBeUndefined();
  });

  describe('decode description', () => {
    test('decode simple html', () => {
      expect(utils.decodeDescription('&amp;')).toBe('&');
      expect(utils.decodeDescription('&quot;')).toBe('"');
      expect(utils.decodeDescription('&apos;')).toBe("'");
      expect(utils.decodeDescription('&rsquo;')).toBe("'");
      expect(utils.decodeDescription('&#039;')).toBe("'");
      expect(utils.decodeDescription('&lt;')).toBe('<');
      expect(utils.decodeDescription('&gt;')).toBe('>');
      expect(utils.decodeDescription('&mdash;')).toBe('-');
    });

    test('strip urls', () => {
      expect(
        utils.decodeDescription('<a href="https://goolge/com/page">page</a>')
      ).toBe('[page](https://goolge/com/page)');

      expect(
        utils.decodeDescription(
          '<a href="https://goolge/com/page">pa\n\nge</a>'
        )
      ).toBe('[pa\n\nge](https://goolge/com/page)');

      expect(
        utils.decodeDescription("<a href='https://goolge/com/page'>page</a>")
      ).toBe('[page](https://goolge/com/page)');

      expect(
        utils.decodeDescription("<a href='https://goolge/com/page'>page<a>")
      ).toBe('[page](https://goolge/com/page)');

      expect(utils.decodeDescription('[page](https://goolge/com/page)')).toBe(
        '[page](https://goolge/com/page)'
      );
    });

    test('decode complicated html', () => {
      expect(utils.decodeDescription('&amp;quot;')).toBe('&quot;');
    });

    test('transform html to markdown', () => {
      expect(utils.decodeDescription('<i>abc</i>')).toBe('*abc*');
      expect(utils.decodeDescription('<i> a\nbc  \n <i>')).toBe('*a\nbc*');
      expect(utils.decodeDescription('<b>abc</b>')).toBe('**abc**');
      expect(utils.decodeDescription('<b>ab\nc \n  <b>')).toBe('**ab\nc**');
      expect(utils.decodeDescription('<strike>abc</strike>')).toBe('~~abc~~');
      expect(utils.decodeDescription('<strike>   abc<strike>')).toBe('~~abc~~');
      expect(utils.decodeDescription('<br></br><br/>')).toBe('\n\n\n');
      expect(utils.decodeDescription('<hr></hr><hr/>')).toBe('\n\n\n');
    });

    test('remove certain tags', () => {
      expect(utils.decodeDescription('~!abc!~')).toBe('');
      expect(utils.decodeDescription('~!a\n\nbc!~')).toBe('');
      expect(utils.decodeDescription('||abc||')).toBe('');
      expect(utils.decodeDescription('||a\nb\nc||')).toBe('');
    });
  });

  test('normal timestamps', () => {
    const now = new Date();
    const expected = new Date().getTime().toString();
    expect(utils.normalTimestamp(now)).toBe(
      expected.substring(0, expected.length - 3)
    );
  });

  test('recharge timestamps', () => {
    const now = new Date();
    const expected = new Date().setMinutes(now.getMinutes() + 30).toString();
    expect(utils.rechargeTimestamp(now)).toBe(
      expected.substring(0, expected.length - 3)
    );
  });

  test('recharge daily tokens timestamps', () => {
    const now = new Date();
    const expected = new Date().setHours(now.getHours() + 12).toString();
    expect(utils.rechargeDailyTimestamp(now)).toBe(
      expected.substring(0, expected.length - 3)
    );
  });

  test('reset steal timestamp', () => {
    const now = new Date();
    const expected = new Date().setDate(now.getDate() + 3).toString();
    expect(utils.rechargeStealTimestamp(now)).toBe(
      expected.substring(0, expected.length - 3)
    );
  });

  describe('diff days', () => {
    test('23 hours', () => {
      const a = new Date();
      const b = new Date();
      b.setHours(b.getHours() - 23);
      expect(utils.diffInDays(a, b)).toBe(0);
    });

    test('25 hours', () => {
      const a = new Date();
      const b = new Date();
      b.setHours(b.getHours() - 25);
      expect(utils.diffInDays(a, b)).toBe(1);
    });

    test('47 hours', () => {
      const a = new Date();
      const b = new Date();
      b.setHours(b.getHours() - 47);
      expect(utils.diffInDays(a, b)).toBe(1);
    });

    test('49 hours', () => {
      const a = new Date();
      const b = new Date();
      b.setHours(b.getHours() - 49);
      expect(utils.diffInDays(a, b)).toBe(2);
    });
  });

  describe('diff mins', () => {
    test('30 mins', () => {
      const a = new Date();
      const b = new Date();
      b.setMinutes(b.getMinutes() - 30);
      expect(utils.diffInMinutes(a, b)).toBe(30);
    });
  });

  test('is within last 14 days', () => {
    const now = new Date();

    const thirteenDaysAgo = new Date();
    thirteenDaysAgo.setDate(now.getDate() - 13);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(now.getDate() - 15);

    expect(utils.isWithin14Days(now)).toBe(true);
    expect(utils.isWithin14Days(thirteenDaysAgo)).toBe(true);
    expect(utils.isWithin14Days(fifteenDaysAgo)).toBe(false);
  });

  test('distance', () => {
    expect(utils.distance('AQUA', 'aqua')).toBe(100);
    expect(utils.distance('cat', 'cow')).toBe(66.66666666666666);
  });

  describe('pagination', () => {
    test('default limit', () => {
      const url = new URL('http://localhost:8000?offset=2');

      const pages = utils.pagination(
        url,
        Array(10)
          .fill({})
          .map((_, i) => `item-${i + 1}`),
        'data'
      );

      expect(pages.data.length).toBe(8);
      expect(pages.length).toBe(10);
      expect(pages.limit).toBe(20);
      expect(pages.offset).toBe(2);

      expect(pages.data[0]).toBe('item-3');
      expect(pages.data[1]).toBe('item-4');
      expect(pages.data[2]).toBe('item-5');
    });

    test('custom limit', () => {
      const url = new URL('http://localhost:8000?limit=3&offset=2');

      const pages = utils.pagination(
        url,
        Array(10)
          .fill({})
          .map((_, i) => `item-${i + 1}`),
        'data'
      );

      expect(pages.data.length).toBe(3);
      expect(pages.length).toBe(10);
      expect(pages.limit).toBe(3);
      expect(pages.offset).toBe(2);

      expect(pages.data[0]).toBe('item-3');
      expect(pages.data[1]).toBe('item-4');
      expect(pages.data[2]).toBe('item-5');
    });

    test('limit equal to the length of data', () => {
      const url = new URL('http://localhost:8000?limit=10&offset=0');

      const pages = utils.pagination(
        url,
        Array(10)
          .fill({})
          .map((_, i) => `item-${i + 1}`),
        'data'
      );

      expect(pages.data.length).toBe(10);
      expect(pages.length).toBe(10);
      expect(pages.limit).toBe(10);
      expect(pages.offset).toBe(0);

      expect(pages.data[0]).toBe('item-1');
      expect(pages.data[1]).toBe('item-2');
      expect(pages.data[2]).toBe('item-3');
      expect(pages.data[9]).toBe('item-10');
    });

    test('offset is higher than length of data', () => {
      const url = new URL('http://localhost:8000?limit=10&offset=11');

      const pages = utils.pagination(
        url,
        Array(10)
          .fill({})
          .map((_, i) => `item-${i + 1}`),
        'data'
      );

      expect(pages.data.length).toBe(0);
      expect(pages.length).toBe(10);
      expect(pages.limit).toBe(10);
      expect(pages.offset).toBe(11);
    });
  });
});
