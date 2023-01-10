import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// import { stub } from 'https://deno.land/std@0.168.0/testing/mock.ts';

import packs from '../src/packs.ts';

import { Manifest, ManifestType } from '../src/types.ts';

Deno.test('anilist', async (test) => {
  const builtin = packs.list(ManifestType.Builtin);

  const manifest = builtin[0] as Manifest;

  await test.step('manifest', () => {
    assertEquals(manifest, {
      'author': 'Fable',
      'type': ManifestType.Builtin,
      'id': 'anilist',
      'title': 'AniList',
      'description':
        'A pack powered by AniList. Contains a huge list of anime and manga characters',
      'url': 'https://anilist.co',
      'image':
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/AniList_logo.svg/512px-AniList_logo.svg.png',
      'commands': {
        'next_episode': {
          'source': 'nextEpisode',
          'description': 'Find when the next episode of an anime is airing',
          'options': [
            {
              'id': 'title',
              'description': 'The title for an anime',
              'type': 'string',
            },
          ],
        },
      },
    });
  });
});

Deno.test('utils', async (test) => {
  const builtin = packs.list(ManifestType.Builtin);

  const manifest = builtin[1] as Manifest;

  await test.step('manifest', () => {
    assertEquals(manifest, {
      'author': 'Fable',
      'type': ManifestType.Builtin,
      'id': 'utils',
      'title': 'Utils',
      'description': 'A pack containing a set of extra commands',
      'commands': {
        'dice': {
          'source': 'roll',
          'description': 'Roll a ten-sided dice',
          'options': [
            {
              'id': 'amount',
              'description': 'The number of dices to roll',
              'type': 'integer',
            },
          ],
        },
      },
    });
  });
});

Deno.test('embeds', async (test) => {
  await test.step('builtin packs', () => {
    const message = packs.embed({
      manifest: {
        id: 'id',
        title: 'title',
        type: ManifestType.Builtin,
      },
      total: 2,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        components: [{
          type: 1,
          components: [{
            custom_id: 'builtin:1',
            label: 'Next',
            style: 2,
            type: 2,
          }],
        }],
        embeds: [{
          description: undefined,
          footer: {
            text: '1/2',
          },
          title: 'title',
          type: 2,
          url: undefined,
        }],
        content:
          'Builtin packs are developed and maintained directly by Fable.',
      },
    });
  });

  await test.step('manual packs', () => {
    const message = packs.embed({
      manifest: {
        id: 'id',
        title: 'title',
        type: ManifestType.Manual,
      },
      index: 1,
      total: 2,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        components: [{
          type: 1,
          components: [{
            custom_id: 'manual:0',
            label: 'Prev',
            style: 2,
            type: 2,
          }],
        }],
        embeds: [{
          description: undefined,
          footer: {
            text: '2/2',
          },
          title: 'title',
          type: 2,
          url: undefined,
        }],
        content:
          'The following packs were installed manually by server members.',
      },
    });
  });

  await test.step('use id instead of title', () => {
    const message = packs.embed({
      manifest: {
        id: 'id',
        type: ManifestType.Manual,
      },
      total: 1,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        components: [],
        embeds: [{
          description: undefined,
          footer: {
            text: '1/1',
          },
          title: 'id',
          type: 2,
          url: undefined,
        }],
        content:
          'The following packs were installed manually by server members.',
      },
    });
  });

  await test.step('no manifest', () => {
    const message = packs.embed({ total: 1 });

    assertEquals(message.json(), {
      type: 4,
      data: {
        components: [],
        embeds: [],
        content: 'No packs have been installed yet.',
      },
    });
  });
});
