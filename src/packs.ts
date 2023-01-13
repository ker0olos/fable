import { Manifest, ManifestType } from './types.ts';

import { Embed, Interaction, Message } from './discord.ts';

import _anilist from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _x from '../packs/x/manifest.json' assert {
  type: 'json',
};

import * as x from '../packs/x/index.ts';
import * as anilist from '../packs/anilist/index.ts';

const anilistManifest = _anilist as Manifest;
const xManifest = _x as Manifest;

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
    return await (anilist as any)[command.source](
      interaction.options!,
      interaction,
    );
  }

  if (name in xManifest.commands!) {
    const command = xManifest.commands![name];
    // deno-lint-ignore no-explicit-any
    return await (x as any)[command.source](
      interaction.options!,
      interaction,
    );
  }
}

function list(type?: ManifestType): Manifest[] {
  const builtin = [
    anilistManifest,
    xManifest,
  ];

  // TODO BLOCKED load manual packs
  // (see https://github.com/ker0olos/fable/issues/10)
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

export default packs;
