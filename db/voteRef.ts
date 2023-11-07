/// <reference lib="deno.unstable" />

import { kv } from './mod.ts';

import utils from '../src/utils.ts';

import { KvError } from '../src/errors.ts';

type Ref = Parameters<typeof createVoteRef>[0];

export async function resolveVoteRef(
  { ref }: { ref: string },
): Promise<Ref | undefined> {
  const { value } = await kv.get<Ref>(['vote_ref', ref]);

  return value ?? undefined;
}

export async function createVoteRef(
  { token, guildId }: { token: string; guildId: string },
): Promise<string> {
  let retries = 0;

  const ref = utils.nanoid(4);

  while (retries < 5) {
    const insert = await kv.atomic()
      .set(['vote_ref', ref], { token, guildId }, {
        expireIn: 5 * 60 * 1000, // 5 minutes
      })
      .commit();

    if (insert.ok) {
      return ref;
    }

    retries += 1;
  }

  throw new KvError('failed to add character');
}
