import { Builtin, Manifest, ManifestType } from './types.ts';

import { Embed, Interaction, Message } from './discord.ts';

import _anilist from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _utils from '../packs/utils/manifest.json' assert {
  type: 'json',
};

import * as utilsAPI from '../packs/utils/index.ts';
import * as anilistAPI from '../packs/anilist/index.ts';

const anilistManifest = _anilist as Builtin;
const utilsManifest = _utils as Builtin;

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
  if (name in anilistManifest.commands!) {
    const command = anilistManifest.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (anilistAPI as any)[command.source](
      interaction.options!,
      interaction,
    );
  }

  if (name in utilsManifest.commands!) {
    const command = utilsManifest.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (utilsAPI as any)[command.source](
      interaction.options!,
      interaction,
    );
  }

  return;
}

function list(type?: ManifestType): Manifest[] {
  const builtin = [
    anilistManifest,
    utilsManifest,
  ].map((manifest) => {
    manifest.author = 'Fable';
    manifest.type = ManifestType.Builtin;
    return manifest;
  });

  const manual = [
    // TODO load manual packs
  ].map((manifest) => {
    // manifest.type = ManifestType.Manual;
    return manifest;
  });

  switch (type) {
    case ManifestType.Builtin:
      return builtin;
    case ManifestType.Manual:
      return manual;
    default:
      return [
        ...builtin,
        ...manual,
      ];
  }
}

function embed(
  { manifest, index, total }: {
    manifest?: Manifest;
    index?: number;
    total: number;
  },
): Message {
  if (!manifest) {
    return new Message()
      .setContent('No packs have been installed yet.');
  }

  const message = Message.page(
    {
      index,
      total,
      id: manifest.type!,
      current: new Embed()
        .setUrl(manifest.url)
        .setDescription(manifest.description)
        .setAuthor({ name: manifest.author })
        .setThumbnail({ url: manifest.icon_url })
        .setTitle(manifest.title),
    },
  );

  message
    .setContent(
      manifest.type! === ManifestType.Builtin
        ? 'Builtin packs are developed and maintained directly by Fable.'
        : 'The following packs were installed manually by server members.',
    );

  return message;
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
//   };
// }

const packs = {
  embed,
  commands,
  list,
};

export default packs;
