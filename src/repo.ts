import { Manifest } from './repo.d.ts';

import { Interaction, Message } from './discord.ts';

import _anilist from '../repos/anilist/manifest.json' assert {
  type: 'json',
};

import _utils from '../repos/utils/manifest.json' assert {
  type: 'json',
};

import * as utilsAPI from '../repos/utils/index.ts';

import * as anilistAPI from '../repos/anilist/index.ts';

const anilistMani = _anilist as Manifest;
const utilsMani = _utils as Manifest;

// TODO
// Builtin > Community > Manual

/**
 * Non-standard commands (extras) are handled by individual repos
 * Non-verified repos can't execute code (not safe)
 * this only runs on official (builtin) repos created by Fable
 */
export async function commands(
  name: string,
  interaction: Interaction<unknown>,
): Promise<Message | undefined> {
  if (name in anilistMani.commands!) {
    const command = anilistMani.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (anilistAPI as any)[command.source](interaction.options!);
  }

  if (name in utilsMani.commands!) {
    const command = utilsMani.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (utilsAPI as any)[command.source](interaction.options!);
  }

  return;
}

export function context() {
  return {
    release: {
      id: Deno.env.get('DENO_DEPLOYMENT_ID')!,
    },
    device: {
      arch: Deno.build.arch,
      processor_count: navigator.hardwareConcurrency,
    },
    os: Deno.build.os,
    deno: {
      version: Deno.version.deno,
      target: Deno.build.target,
    },
    v8: Deno.version.v8,
    typescript: Deno.version.typescript,
    repositories: [
      anilist,
      utils,
    ] as Manifest[],
  };
}
