import { Manifest } from './types.ts';

import { Interaction, Message } from './discord.ts';

import _anilist from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _utils from '../packs/utils/manifest.json' assert {
  type: 'json',
};

import * as utilsAPI from '../packs/utils/index.ts';
import * as anilistAPI from '../packs/anilist/index.ts';

const anilistMani = _anilist as Manifest;
const utilsMani = _utils as Manifest;

/**
 * Non-standard commands (extras) are handled by individual packs
 * Only official builtin packs can execute code
 * (no dynamic imports allowed in deno deploy)
 * (not safe and won't trust it even if deno could)
 */
async function commands(
  name: string,
  interaction: Interaction<unknown>,
): Promise<Message | undefined> {
  if (name in anilistMani.commands!) {
    const command = anilistMani.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (anilistAPI as any)[command.source](
      interaction.options!,
      interaction,
    );
  }

  if (name in utilsMani.commands!) {
    const command = utilsMani.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (utilsAPI as any)[command.source](
      interaction.options!,
      interaction,
    );
  }

  return;
}

function builtin() {
  return [
    anilistMani,
    utilsMani,
  ];
}

// function context() {
//   return {
//     release: {
//       id: Deno.env.get('DENO_DEPLOYMENT_ID')!,
//     },
//     device: {
//       arch: Deno.build.arch,
//       processor_count: navigator.hardwareConcurrency,
//     },
//     os: Deno.build.os,
//     deno: {
//       version: Deno.version.deno,
//       target: Deno.build.target,
//     },
//     v8: Deno.version.v8,
//     typescript: Deno.version.typescript,
//     packs: [
//       _anilist,
//       _utils,
//     ] as Manifest[],
//   };
// }

const packs = {
  commands,
  builtin,
};

export default packs;
