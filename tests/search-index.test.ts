// deno-lint-ignore-file no-explicit-any

import { assertSnapshot } from '$std/testing/snapshot.ts';
import { stub } from '$std/testing/mock.ts';

import searchIndex from '~/search-index/mod.ts';

import packs from '~/src/packs.ts';

const toString = async (
  characters: ReturnType<typeof searchIndex.searchCharacters>,
) => {
  const results = await characters;
  return results.map((c) => ({
    id: c.id,
    mediaId: c.mediaId,
    name: c.name,
    mediaTitle: c.mediaTitle,
    popularity: c.popularity,
    rating: c.rating,
    role: c.role,
  }));
};

const toString2 = async (
  media: ReturnType<typeof searchIndex.searchMedia>,
) => {
  const results = await media;
  return results.map((m) => ({
    id: m.id,
    title: m.title,
    popularity: m.popularity,
  }));
};

Deno.test('characters search', async (test) => {
  await test.step('aqua', async (test) => {
    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    try {
      await assertSnapshot(
        test,
        await toString(searchIndex.searchCharacters('aqua', '')),
      );
    } finally {
      listStub.restore();
    }
  });

  await test.step('megumin', async (test) => {
    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    try {
      await assertSnapshot(
        test,
        await toString(searchIndex.searchCharacters('megumin', '')),
      );
    } finally {
      listStub.restore();
    }
  });

  await test.step('sayuri haruno', async (test) => {
    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    try {
      await assertSnapshot(
        test,
        await toString(searchIndex.searchCharacters('sayuri haruno', '')),
      );
    } finally {
      listStub.restore();
    }
  });

  // await test.step('konosuba', async (test) => {
  //   const listStub = stub(packs, 'all', () =>
  //     Promise.resolve([
  //       { manifest: { id: 'anilist' } },
  //     ] as any));

  //   try {
  //     await assertSnapshot(
  //       test,
  //       await toString(searchIndex.searchCharacters('konosuba', '')),
  //     );
  //   } finally {
  //     listStub.restore();
  //   }
  // });
});

Deno.test('media search', async (test) => {
  await test.step('konosuba', async (test) => {
    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    try {
      await assertSnapshot(
        test,
        await toString2(searchIndex.searchMedia('konosuba', '')),
      );
    } finally {
      listStub.restore();
    }
  });
});
