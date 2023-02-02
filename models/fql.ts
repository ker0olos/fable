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

const fql = query as typeof _query;

type TypedExpr<T> = Expr & { type?: T };

export type StringExpr = string | TypedExpr<'string'>;
export type NumberExpr = number | TypedExpr<'number'>;
export type BooleanExpr = boolean | TypedExpr<'boolean'>;
export type LambdaExpr = (...vars: any[]) => ExprArg;

export type TimeExpr = TypedExpr<'time'>;
export type IndexExpr = TypedExpr<'index'>;
export type MatchExpr = TypedExpr<'match'>;
// export type DocumentExpr = TypedExpr<'document'>;
export type RefExpr = TypedExpr<'ref'>;
// export type DataExpr = TypedExpr<'data'>;

export type UserExpr = TypedExpr<'user'>;
export type GuildExpr = TypedExpr<'guild'>;
export type InstanceExpr = TypedExpr<'instance'>;
export type InventoryExpr = TypedExpr<'inventory'>;

export interface User {
  id: StringExpr;
  inventories: RefExpr[];
}

export interface Guild {
  id: StringExpr;
  instances: RefExpr[];
}

export interface Instance {
  main: BooleanExpr;
  guild: RefExpr;
  inventories: RefExpr[];
}

export interface Inventory {
  lastPull: TimeExpr;
  availablePulls: NumberExpr;
  instance: RefExpr;
  user: RefExpr;
}

export function Ref(document: Expr): RefExpr {
  return fql.Select('ref', document);
}

export function Create<T = Expr>(collection: string, data: T): Expr {
  return fql.Create(fql.Collection(collection), {
    data,
  });
}

export function Update<T = Expr>(ref: RefExpr, data: Partial<T>): Expr {
  return fql.Update(ref, {
    data,
  });
}

export function Index(name: string): IndexExpr {
  return fql.FaunaIndex(name);
}

export function Match(index: IndexExpr, ...terms: ExprArg[]): MatchExpr {
  return fql.Match(index, ...terms);
}

export function Get(refOrMatch: RefExpr | MatchExpr): Expr {
  return fql.Get(refOrMatch);
}

export function Append(ref: RefExpr, items: Expr): RefExpr[] {
  return fql.Append(ref, items) as unknown as RefExpr[];
}

export function IsNonEmpty(expr: Expr): BooleanExpr {
  return fql.IsNonEmpty(expr);
}

export function If<A = Expr, B = Expr>(
  cond: BooleanExpr,
  _then: Expr,
  _else: Expr,
): A | B {
  return fql.If(cond, _then, _else) as A | B;
}

export function updateResolver(
  { client, name, lambda }: {
    name: string;
    client: Client;
    lambda: LambdaExpr;
  },
): Promise<void> {
  return client.query(
    fql.Update(fql.FaunaFunction(name), {
      body: fql.Query(lambda),
    }),
  );
}

export function Let(vars: Record<string, ExprArg>, _in: Expr): Expr {
  return fql.Let(vars, _in);
}

export function Var(name: StringExpr): Expr {
  return fql.Var(name);
}

export function Intersection(a: Expr, b: Expr): Expr {
  return fql.Intersection(a, b);
}

export function Select(path: ExprArg[], from: Expr): Expr {
  return fql.Select(path, from);
}

export function Now(): TimeExpr {
  return fql.Now();
}

export type { Client };
