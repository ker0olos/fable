/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, afterEach } from 'vitest';

import searchIndex from '~/search-index-mod/index.ts';
import packs from '~/src/packs.ts';

const toString = async (
  characters: ReturnType<typeof searchIndex.searchCharacters>
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

const toString2 = async (media: ReturnType<typeof searchIndex.searchMedia>) => {
  const results = await media;
  return results.map((m) => ({
    id: m.id,
    title: m.title,
    popularity: m.popularity,
  }));
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('characters search', () => {
  test('aqua', async () => {
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    expect(
      await toString(searchIndex.searchCharacters('aqua', ''))
    ).toMatchSnapshot();
  });

  test('megumin', async () => {
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    expect(
      await toString(searchIndex.searchCharacters('megumin', ''))
    ).toMatchSnapshot();
  });

  test('sayuri haruno', async () => {
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    expect(
      await toString(searchIndex.searchCharacters('sayuri haruno', ''))
    ).toMatchSnapshot();
  });

  test('jahy', async () => {
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    expect(
      await toString(searchIndex.searchCharacters('jahy', ''))
    ).toMatchSnapshot();
  });

  // test('konosuba', async () => {
  //   vi.spyOn(packs, 'all').mockResolvedValue([{ manifest: { id: 'anilist' } }] as any);

  //   expect(
  //     await toString(searchIndex.searchCharacters('konosuba', ''))
  //   ).toMatchSnapshot();
  // });
});

describe('media search', () => {
  test('konosuba', async () => {
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    expect(
      await toString2(searchIndex.searchMedia('konosuba', ''))
    ).toMatchSnapshot();
  });
});
