import { Expr } from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

type TypedExpr<T> = Expr & { type?: T };

export type StringExpr = string | TypedExpr<'string'>;
export type NumberExpr = number | TypedExpr<'number'>;
export type BooleanExpr = boolean | TypedExpr<'boolean'>;
export type ObjectExpr = Record<string, unknown> | TypedExpr<'object'>;

export type MatchExpr = TypedExpr<'match'>;
export type DocumentExpr = TypedExpr<'document'>;
export type RefExpr = TypedExpr<'ref'>;
export type DataExpr = TypedExpr<'data'>;

export type UserExpr = TypedExpr<'user'>;
export type GuildExpr = TypedExpr<'guild'>;
export type InstanceExpr = TypedExpr<'instance'>;
export type InventoryExpr = TypedExpr<'inventory'>;
