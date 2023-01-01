import { Interaction, Message } from './discord.ts';

import _anilist from '../repos/anilist/manifest.json' assert {
  type: 'json',
};

import _utils from '../repos/utils/manifest.json' assert {
  type: 'json',
};

import { Manifest } from './repo.d.ts';

const anilist = _anilist as Manifest;
const utils = _utils as Manifest;

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
  if (name in anilist.commands!) {
    const api = await import(anilist.source!);
    const command = anilist.commands![name];
    return await api[command.source](interaction.options!);
  }

  if (name in utils.commands!) {
    const api = await import(utils.source!);
    const command = utils.commands![name];
    return await api[command.source](interaction.options!);
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
