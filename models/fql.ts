// deno-lint-ignore-file no-explicit-any

import { spy } from 'https://deno.land/std@0.183.0/testing/mock.ts';

import {
  Client,
  query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import {
  Expr,
  ExprArg,
  type query as _query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

const _fql = query as typeof _query;

type TypedExpr<T> = Expr & { type?: T };

export type StringExpr = string | TypedExpr<'string'>;
export type NumberExpr = number | TypedExpr<'number'>;
export type BooleanExpr = boolean | TypedExpr<'boolean'>;

export type NullExpr = TypedExpr<'null'>;
export type TimeExpr = TypedExpr<'time'>;
export type IndexExpr = TypedExpr<'index'>;
export type MatchExpr = TypedExpr<'match'>;
export type RefExpr = TypedExpr<'ref'>;

export type ResponseExpr = TypedExpr<'response'>;

export type UserExpr = TypedExpr<'user'>;
export type GuildExpr = TypedExpr<'guild'>;
export type InstanceExpr = TypedExpr<'instance'>;
export type InventoryExpr = TypedExpr<'inventory'>;
export type CharacterExpr = TypedExpr<'character'>;
export type PackExpr = TypedExpr<'pack'>;
export type ManifestExpr = TypedExpr<'manifest'>;

function Ref(document: Expr): RefExpr {
  return _fql.Select('ref', document);
}

function Id(name: StringExpr, id: StringExpr): RefExpr {
  return _fql.Ref(_fql.Collection(name), id);
}

function Create<T = Expr>(collection: string, data: T): Expr {
  return _fql.Create(_fql.Collection(collection), {
    data,
  });
}

function Update<T = Expr>(ref: RefExpr, data: Partial<T>): Expr {
  return _fql.Update(ref, {
    data,
  });
}

function Index(name: string): IndexExpr {
  return _fql.FaunaIndex(name);
}

function Match(index: IndexExpr, ...terms: ExprArg[]): MatchExpr {
  return _fql.Match(index, ...terms);
}

function Get(refOrMatch: Expr | ExprArg): Expr {
  return _fql.Get(refOrMatch);
}

function Append<T extends ExprArg>(ref: T, items: T[]): T[] {
  return _fql.Append(ref, items) as unknown as T[];
}

function AppendAll<T extends ExprArg>(refs: T[], items: T[]): T[] {
  return _fql.Union(items, refs) as unknown as T[];
}

function Remove<T extends ExprArg>(ref: T, items: T[]): T[] {
  return _fql.Difference(items, [ref]) as unknown as T[];
}

function RemoveAll<T extends ExprArg>(refs: T[], items: T[]): T[] {
  return _fql.Difference(items, refs) as unknown as T[];
}

function Delete(ref: RefExpr): Expr {
  return _fql.Delete(ref);
}

function Includes<T extends ExprArg>(
  value: T,
  documentOrArray: T | T[],
): BooleanExpr {
  return _fql.ContainsValue(value, documentOrArray) as unknown as BooleanExpr;
}

function IncludesAll<T extends ExprArg>(
  values: T[],
  array: T[],
): BooleanExpr {
  return _fql.All(
    _fql.Map(values, (v) => _fql.ContainsValue(v, array)),
  ) as unknown as BooleanExpr;
}

function Paginate<T extends ExprArg>(
  expr: Expr,
  { size, before, after }: { size?: number; before?: any; after?: any },
): T[] {
  return _fql.Paginate(expr, {
    size,
    before,
    after,
  }) as unknown as T[];
}

function Foreach<T = ExprArg>(
  setOrArray: T[],
  func: (...args: T[]) => any,
): void {
  return _fql.Foreach(setOrArray, func) as unknown as void;
}

function Map<T = ExprArg, V = Expr>(
  setOrArray: T[],
  func: (...args: T[]) => V,
): V[] {
  return _fql.Map(setOrArray, func) as unknown as V[];
}

function Filter<T = ExprArg>(
  setOrArray: T[],
  func: (...args: T[]) => BooleanExpr,
): T[] {
  return _fql.Filter(setOrArray, func) as unknown as T[];
}

function Any<T = Expr>(setOrArray: T[]): boolean {
  return _fql.Any(setOrArray) as unknown as boolean;
}

function All<T = Expr>(setOrArray: T[]): boolean {
  return _fql.All(setOrArray) as unknown as boolean;
}

function IsEmpty(expr: Expr | ExprArg[]): BooleanExpr {
  return _fql.IsEmpty(expr);
}

function IsNonEmpty(expr: Expr | ExprArg[]): BooleanExpr {
  return _fql.IsNonEmpty(expr);
}

function Min(a: NumberExpr, b: NumberExpr): NumberExpr {
  return _fql.Min(a, b);
}

function Max(a: NumberExpr, b: NumberExpr): NumberExpr {
  return _fql.Max(a, b);
}

function GTE(a: NumberExpr, b: NumberExpr): BooleanExpr {
  return _fql.GTE(a, b);
}

function LTE(a: NumberExpr, b: NumberExpr): BooleanExpr {
  return _fql.LTE(a, b);
}

function Multiply(a: NumberExpr, b: NumberExpr): NumberExpr {
  return _fql.Multiply(a, b);
}

function Divide(a: NumberExpr, b: NumberExpr): NumberExpr {
  return _fql.Divide(a, b);
}

function Subtract(a: NumberExpr, b: NumberExpr): NumberExpr {
  return _fql.Subtract(a, b);
}

function Add(a: NumberExpr, b: NumberExpr): NumberExpr {
  return _fql.Add(a, b);
}

function If<A = Expr, B = Expr>(
  cond: BooleanExpr,
  _then: Expr | ExprArg,
  _else: Expr | ExprArg,
): A | B {
  return _fql.If(cond, _then, _else) as A | B;
}

function Equals<A = Expr, B = Expr>(a?: A, b?: B): BooleanExpr {
  // deno-lint-ignore no-non-null-assertion
  return _fql.Equals(a!, b!);
}

function Not(b: BooleanExpr): BooleanExpr {
  return _fql.Not(b);
}

function Concat(s: StringExpr[], sep?: StringExpr): StringExpr {
  return _fql.Concat(s, sep ?? '');
}

function ToString(n: NumberExpr): StringExpr {
  return _fql.ToString(n);
}

function IsNull(expr?: ExprArg): BooleanExpr {
  // deno-lint-ignore no-non-null-assertion
  return _fql.Equals(expr!, fql.Null());
}

function Let<T, U>(
  params: { [K in keyof T]: T[K] },
  cb: (shadows: typeof params) => U,
): U {
  const shadows: any = {};

  for (const obj of Object.keys(params)) {
    shadows[obj] = _fql.Var(obj);
  }

  return _fql.Let(params, cb(shadows) as any) as U;
}

function Var<T extends ExprArg>(name: StringExpr): T {
  return _fql.Var(name) as unknown as T;
}

function Select<T extends ExprArg>(
  path: (StringExpr | NumberExpr)[],
  from: Expr | ExprArg[],
  _default?: T,
): T {
  return _fql.Select(path, from, _default) as unknown as T;
}

function Merge(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): Expr {
  return _fql.Merge(obj1, obj2);
}

function Reverse(expr: Expr): Expr {
  return _fql.Reverse(expr);
}

function TimeDiffInMinutes(a: TimeExpr, b: TimeExpr): NumberExpr {
  return _fql.TimeDiff(a, b, 'minutes');
}

function And(...args: BooleanExpr[]): BooleanExpr {
  return _fql.And(...args);
}

function Or(...args: BooleanExpr[]): BooleanExpr {
  return _fql.Or(...args);
}

function TimeAddInMinutes(t: TimeExpr, offset: NumberExpr): NumberExpr {
  return _fql.TimeAdd(t, offset, 'minutes');
}

function Now(): TimeExpr {
  return _fql.Now();
}

function Null(): NullExpr {
  return null as unknown as NullExpr;
}

function Indexer(
  { client, name, unique, collection, values, terms }: {
    client: Client;
    unique: boolean;
    collection: string;
    name: string;
    terms?: {
      field: string[];
    }[];
    values?: {
      field: string[];
      reverse?: boolean;
    }[];
  },
): () => Promise<void> {
  const params = {
    name,
    unique,
    source: _fql.Collection(collection),
    terms,
    values,
  };

  return () =>
    client.query(
      _fql.If(
        _fql.Exists(_fql.FaunaIndex(name)),
        _fql.Update(_fql.FaunaIndex(name), params),
        _fql.CreateIndex(params),
      ),
    );
}

function Resolver(
  { client, name, lambda }: {
    name: string;
    client: Client;
    lambda: (...vars: any[]) => ExprArg;
  },
): () => Promise<void> {
  const params = {
    name,
    body: _fql.Query(lambda),
  };

  return () =>
    client.query(
      _fql.If(
        _fql.Exists(_fql.FaunaFunction(name)),
        _fql.Update(_fql.FaunaFunction(name), params),
        _fql.CreateFunction(params),
      ),
    );
}

export const fql = {
  Add,
  All,
  And,
  Any,
  Append,
  AppendAll,
  Concat,
  Create,
  Delete,
  Divide,
  Equals,
  Filter,
  Foreach,
  Get,
  GTE,
  Id,
  If,
  Includes,
  IncludesAll,
  Index,
  Indexer,
  IsEmpty,
  IsNonEmpty,
  IsNull,
  Let,
  LTE,
  Map,
  Match,
  Max,
  Merge,
  Min,
  Multiply,
  Not,
  Now,
  Null,
  Or,
  Paginate,
  Ref,
  Remove,
  RemoveAll,
  Resolver,
  Reverse,
  Select,
  Subtract,
  TimeAddInMinutes,
  TimeDiffInMinutes,
  ToString,
  Update,
  Var,
};

export const FakeClient = () => ({
  query: spy(),
});

export type { Client };
