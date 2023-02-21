// deno-lint-ignore-file no-explicit-any

import { spy, stub } from 'https://deno.land/std@0.177.0/testing/mock.ts';

import { fql } from './fql.ts';

export const FakeIndex = () => stub(fql, 'Index', (name) => name as any);

export const FakeRef = () =>
  stub(fql, 'Ref', (obj: any) => ({ ref: obj }) as any);

export const FakeVar = (obj?: any) =>
  stub(
    fql,
    'Var',
    (name) =>
      (obj?.[name as string] !== undefined
        ? JSON.parse(JSON.stringify(obj?.[name as string]))
        : name) as any,
  );

export const FakeLet = () => stub(fql, 'Let', (params, cb) => cb(params));

export const FakeGet = () =>
  stub(fql, 'Get', (refOrMatch) => {
    if (Array.isArray(refOrMatch)) {
      return refOrMatch.shift();
    } else {
      return refOrMatch;
    }
  });

export const FakeAppend = () => stub(fql, 'Append', (a: any, b: any) => [a, b]);

export const FakeGTE = () => stub(fql, 'GTE', (a: any, b: any) => a >= b);
export const FakeLTE = () => stub(fql, 'LTE', (a: any, b: any) => a <= b);

export const FakMultiply = () =>
  stub(fql, 'Multiply', (a: any, b: any) => a * b);

export const FakeDivide = () => stub(fql, 'Divide', (a: any, b: any) => a / b);

export const FakeSubtract = () =>
  stub(fql, 'Subtract', (a: any, b: any) => a - b);

export const FakeAdd = () => stub(fql, 'Add', (a: any, b: any) => a + b);

export const FakeIsNull = () =>
  stub(fql, 'IsNull', (a: any) => a === undefined);

export const FakeMin = () =>
  stub(fql, 'Min', (a: any, b: any) => Math.min(a, b));

export const FakeId = () => stub(fql, 'Id', (_: any, id: any) => id);

export const FakePaginate = () =>
  stub(fql, 'Paginate', (set: any, opts?: any) => {
    if (opts['before']) {
      set = set.toReversed();
      const index = set.findIndex((item: any) => {
        return Array.isArray(opts['before'])
          ? item === opts['before'][1]
          : item === opts['before'];
      });

      if (index !== -1) {
        set.splice(index, 1);
        return set.slice(index, opts['size']);
      }

      return [];
    }

    if (opts['after']) {
      const index = set.findIndex((item: any) => {
        return Array.isArray(opts['after'])
          ? item === opts['after'][1]
          : item === opts['after'];
      });

      if (index !== -1) {
        return set.slice(index, opts['size']);
      }

      return [];
    }

    return set.slice(0, opts['size']);
  });

export const FakeIsNonEmpty = () =>
  stub(fql, 'IsNonEmpty', (match: any) => {
    return (Array.isArray(match) ? match.length > 0 : Boolean(match)) as any;
  });

export const FakeReverse = () =>
  stub(fql, 'Reverse', (array: any) => array.toReversed() as any);

export const FakeSelect = (obj?: any) =>
  stub(fql, 'Select', (_, __, _d) => obj === undefined ? _d : obj);

export const FakeMatch = (obj?: any) =>
  stub(
    fql,
    'Match',
    (_: any, ...terms: any[]) => obj ? ({ ...obj, ...terms }) : undefined,
  );

export const FakeNow = (date?: Date) =>
  stub(fql, 'Now', () => date ?? new Date() as any);

export const FakeTimeDiff = () =>
  stub(fql, 'TimeDiffInMinutes', (a: any, b: any) => {
    const diff = new Date(b).getTime() - new Date(a).getTime();
    return (diff / 60000);
  });

export const FakeTimeAdd = () =>
  stub(fql, 'TimeAddInMinutes', (t: any, offset: any) => {
    return new Date(t.getTime() + offset * 60000) as any;
  });

export const FakeCreate = () => stub(fql, 'Create', (name: any) => name);
export const FakeUpdate = () => stub(fql, 'Update', (name: any) => name);

export const FakeIf = () =>
  stub(
    fql,
    'If',
    ((cond: boolean, _then: any, _else: any) => cond ? _then : _else) as any,
  );

export const FakeClient = () => ({
  query: spy(),
});
