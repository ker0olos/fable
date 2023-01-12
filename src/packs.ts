// // @deno-types="https://raw.githubusercontent.com/greggman/unzipit/v1.3.6/dist/unzipit.module.d.ts"
// import { unzip } from 'https://raw.githubusercontent.com/greggman/unzipit/v1.3.6/dist/unzipit.module.js';

import { Manifest, ManifestType } from './types.ts';

import { Embed, Interaction, Message } from './discord.ts';

import _anilist from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _utils from '../packs/utils/manifest.json' assert {
  type: 'json',
};

import * as utilsAPI from '../packs/utils/index.ts';
import * as anilistAPI from '../packs/anilist/index.ts';

const anilistManifest = _anilist as Manifest;
const utilsManifest = _utils as Manifest;

const packs = {
  embed,
  commands,
  list,
};

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
}

function list(type?: ManifestType): Manifest[] {
  const builtin = [
    anilistManifest,
    utilsManifest,
  ];

  // TODO load manual packs
  // const manual = [
  // ];

  switch (type) {
    case ManifestType.Builtin:
      return builtin;
    // case ManifestType.Manual:
    //   return manual;
    default:
      return [
        ...builtin,
        // ...manual,
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
        .setThumbnail({ url: manifest.image })
        .setTitle(manifest.title ?? manifest.id),
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

// async function git(
//   { owner, name, ref }: { owner: string; name: string; ref?: string },
// ) {
//   const { entries } = await unzip(
//     `https://api.github.com/repos/${owner}/${name}/zipball/${ref ?? ''}`,
//   );

//   const manifests = Object.values(entries)
//     .filter(({ name }) => name.endsWith('manifest.json'))
//     .map((entry) => {
//       return entry.json() as Promise<Manifest>;
//     });

//   return Promise.all(manifests);
// }

export default packs;
