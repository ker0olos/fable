import utils from './utils.ts';

import { PoolInfo } from './types.ts';

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
