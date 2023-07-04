import utils from './utils.ts';

export class GraphQLError extends Error {
  constructor(
    url: string,
    query: string,
    // deno-lint-ignore no-explicit-any
    variables: any,
    message: string,
  ) {
    super(message, {
      cause: {
        url,
        query,
        variables,
      },
    });

    this.name = 'GraphQLError';
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
  rechargeTimestamp: string;

  constructor(rechargeTimestamp?: string) {
    super('NO_PULLS_AVAILABLE');

    this.name = 'NoPullsError';
    this.rechargeTimestamp = utils.rechargeTimestamp(
      rechargeTimestamp,
    );
  }
}

export class PoolError extends Error {
  constructor() {
    super(
      'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
    );

    this.name = 'PoolError';
  }
}
