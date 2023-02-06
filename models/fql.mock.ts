// deno-lint-ignore-file no-explicit-any

import { spy, stub } from 'https://deno.land/std@0.175.0/testing/mock.ts';

import { fql } from './fql.ts';

export const FakeIndex = () => stub(fql, 'Index', (name) => name as any);

export const FakeRef = () =>
  stub(fql, 'Ref', (obj: any) => ({ ref: obj }) as any);

export const FakeVar = () => stub(fql, 'Var', (name) => name as any);
export const FakeLet = () => stub(fql, 'Let', (params, cb) => cb(params));
export const FakeGet = () => stub(fql, 'Get', (r) => r);
export const FakeAppend = () => stub(fql, 'Append', (a: any, b: any) => [a, b]);

export const FakeGTE = () => stub(fql, 'GTE', (a: any, b: any) => a >= b);
export const FakeLTE = () => stub(fql, 'LTE', (a: any, b: any) => a <= b);

export const FakeSubtract = () =>
  stub(fql, 'Subtract', (a: any, b: any) => a - b);

export const FakeAnd = () => stub(fql, 'And', (a: any, b: any) => a && b);
export const FakeIsNonEmpty = () =>
  stub(fql, 'IsNonEmpty', ((match: any) => Boolean(match)) as any);

export const FakeSelect = (obj?: any) => stub(fql, 'Select', () => obj);
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
    const diff = b.getTime() - a.getTime();
    return (diff / 60000);
  });

export const FakeCreate = () =>
  stub(fql, 'Create', (_: any, data: any) => data);
export const FakeUpdate = () =>
  stub(fql, 'Update', (_: any, data: any) => data);

export const FakeIf = () =>
  stub(
    fql,
    'If',
    ((cond: boolean, _then: any, _else: any) => cond ? _then : _else) as any,
  );

export const FakeClient = () => ({
  query: spy(),
});
