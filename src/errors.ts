import utils from './utils.ts';

import { PoolInfo } from './types.ts';

export class GraphQLError extends Error {
  url: string;
  query: string;
  // deno-lint-ignore no-explicit-any
  variables: any;
  response: string;

  constructor(
    url: string,
    query: string,
    // deno-lint-ignore no-explicit-any
    variables: any,
    response: string,
    message: string,
  ) {
    super(message);

    this.name = 'GraphQLError';
    this.url = url;
    this.query = query;
    this.variables = variables;
    this.response = response;
  }
}

export class NoPermissionError extends Error {
  constructor() {
    super('Forbidden');

    this.name = 'NoPermissionError';
  }
}

export class NonFetalError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'NonFetalError';
  }
}

export class NoPullsError extends Error {
  refillTimestamp: string;

  constructor(lastPull: string) {
    super('NO_PULLS_AVAILABLE');

    this.name = 'NoPullsError';
    this.refillTimestamp = utils.lastPullToRefillTimestamp(lastPull);
  }
}

export class PoolError extends Error {
  info: PoolInfo;

  constructor(info: PoolInfo) {
    const message =
      'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables';

    super(message);

    this.name = 'PoolError';
    this.info = info;
  }
}
