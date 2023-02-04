// deno-lint-ignore-file no-explicit-any

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

export type UserExpr = TypedExpr<'user'>;
export type GuildExpr = TypedExpr<'guild'>;
export type InstanceExpr = TypedExpr<'instance'>;
export type InventoryExpr = TypedExpr<'inventory'>;

function Ref(document: Expr): RefExpr {
  return _fql.Select('ref', document);
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

function Match(index: IndexExpr, term: StringExpr): MatchExpr {
  return _fql.Match(index, term);
}

function Get(refOrMatch: RefExpr | MatchExpr): Expr {
  return _fql.Get(refOrMatch);
}

function Append(ref: RefExpr, items: Expr): RefExpr[] {
  return _fql.Append(ref, items) as unknown as RefExpr[];
}

function IsNonEmpty(expr: Expr): BooleanExpr {
  return _fql.IsNonEmpty(expr);
}

function And(a: BooleanExpr, b: BooleanExpr): BooleanExpr {
  return _fql.And(a, b);
}

function Or(a: BooleanExpr, b: BooleanExpr): BooleanExpr {
  return _fql.Or(a, b);
}

function GTE(a: NumberExpr, b: NumberExpr): BooleanExpr {
  return _fql.GTE(a, b);
}

function LTE(a: NumberExpr, b: NumberExpr): BooleanExpr {
  return _fql.LTE(a, b);
}

function If<A = Expr, B = Expr>(
  cond: BooleanExpr,
  _then: Expr,
  _else: Expr,
): A | B {
  return _fql.If(cond, _then, _else) as A | B;
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

function Var(name: StringExpr): Expr {
  return _fql.Var(name);
}

function Intersection(a: Expr, b: Expr): Expr {
  return _fql.Intersection(a, b);
}

function Select(path: (StringExpr | NumberExpr)[], from: Expr): Expr {
  return _fql.Select(path, from);
}

function TimeDiffInMinutes(a: TimeExpr, b: TimeExpr): NumberExpr {
  return _fql.TimeDiff(a, b, 'minutes');
}

function Now(): TimeExpr {
  return _fql.Now();
}

function Null(): NullExpr {
  return null as unknown as NullExpr;
}

function Resolver(
  { client, name, lambda }: {
    name: string;
    client: Client;
    lambda: (...vars: any[]) => ExprArg;
  },
): Promise<void> {
  return client.query(
    _fql.Update(_fql.FaunaFunction(name), {
      body: _fql.Query(lambda),
    }),
  );
}

export const fql = {
  And,
  Append,
  Create,
  GTE,
  Get,
  If,
  Index,
  Intersection,
  IsNonEmpty,
  LTE,
  Let,
  Match,
  Now,
  Null,
  Or,
  Ref,
  Resolver,
  Select,
  TimeDiffInMinutes,
  Update,
  Var,
};

export type { Client };
