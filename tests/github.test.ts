import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import utils from '../src/utils.ts';
import github from '../src/github.ts';

import { NonFetalError } from '../src/errors.ts';

import { CharacterRole, MediaType } from '../src/types.ts';

Deno.test('get repo', async (test) => {
  await test.step('with name', async () => {
    const url = 'username/reponame';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() => Promise.resolve({ id: 1 })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const repo = await github.get(url);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/username/reponame'],
      });

      // deno-lint-ignore no-explicit-any
      assertEquals(repo, { id: 1 } as any);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('with capitalized name', async () => {
    const url = 'Username/Reponame';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() => Promise.resolve({ id: 1 })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const repo = await github.get(url);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/Username/Reponame'],
      });

      // deno-lint-ignore no-explicit-any
      assertEquals(repo, { id: 1 } as any);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('with url', async () => {
    const url = 'https://github.com/username/reponame';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() => Promise.resolve({ id: 1 })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const repo = await github.get(url);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/username/reponame'],
      });

      // deno-lint-ignore no-explicit-any
      assertEquals(repo, { id: 1 } as any);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('ends with .git', async () => {
    const url = 'https://github.com/username/reponame.git';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() => Promise.resolve({ id: 1 })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const repo = await github.get(url);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/username/reponame'],
      });

      // deno-lint-ignore no-explicit-any
      assertEquals(repo, { id: 1 } as any);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('ends with slash', async () => {
    const url = 'https://github.com/username/reponame/';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() => Promise.resolve({ id: 1 })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const repo = await github.get(url);

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/username/reponame/'],
      });

      // deno-lint-ignore no-explicit-any
      assertEquals(repo, { id: 1 } as any);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('invalid name', async () => {
    const url = 'owner/name%83';

    await assertRejects(
      async () => await github.get(url),
      NonFetalError,
      '`owner/name%83` is not a valid GitHub URL',
    );
  });

  await test.step('invalid url', async () => {
    const url = 'url';

    await assertRejects(
      async () => await github.get(url),
      NonFetalError,
      '`url` is not a valid GitHub URL',
    );
  });

  await test.step('invalid hostname', async () => {
    const url = 'https://gitlab.com/owner/repo.git';

    await assertRejects(
      async () => await github.get(url),
      NonFetalError,
      '`https://gitlab.com/owner/repo.git` is not a valid GitHub URL',
    );
  });

  await test.step('invalid protocol', async () => {
    const url = 'git@github.com:owner/repo.git';

    await assertRejects(
      async () => await github.get(url),
      NonFetalError,
      'git@github.com:owner/repo.git` is not a valid GitHub URL',
    );
  });

  await test.step('failed to fetch', async () => {
    const url = 'https://github.com/username/reponame';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      await assertRejects(
        async () => await github.get(url),
        NonFetalError,
        '**404** Not Found\nFailed to Fetch Repository.',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/username/reponame'],
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('github error', async () => {
    const url = 'https://github.com/username/reponame';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() => Promise.resolve({ message: 'Not Found' })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      await assertRejects(
        async () => await github.get(url),
        NonFetalError,
        'Not Found',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCall(fetchStub, 0, {
        args: ['https://api.github.com/repos/username/reponame'],
      });
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('get manifest', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () =>
        ({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'repo_id',
            }),
          // deno-lint-ignore no-explicit-any
        }) as any,
    );

    const unzipStub = stub(
      utils,
      'unzip',
      () => ({
        entries: {
          '0': {
            name: 'manifest.json',
            text: (() => Promise.resolve(JSON.stringify({ id: 'manifest' }))),
          },
        },
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const manifest = await github.manifest({ url: 'username/reponame' });

      assertSpyCall(fetchStub, 0, {
        args: [`https://api.github.com/repos/username/reponame`],
      });

      assertSpyCall(unzipStub, 0, {
        args: [`https://api.github.com/repositories/repo_id/zipball/`],
      });

      assertEquals(manifest, {
        // deno-lint-ignore no-explicit-any
        repo: { id: 'repo_id' } as any,
        manifest: { id: 'manifest' },
      });
    } finally {
      fetchStub.restore();
      unzipStub.restore();
    }
  });

  await test.step('bad character repaired', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () =>
        ({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'repo_id',
            }),
          // deno-lint-ignore no-explicit-any
        }) as any,
    );

    const unzipStub = stub(
      utils,
      'unzip',
      () => ({
        entries: {
          '0': {
            name: 'manifest.json',
            text: (() => Promise.resolve('{ "id": "manifest }')),
          },
        },
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const manifest = await github.manifest({ url: 'username/reponame' });

      assertSpyCall(fetchStub, 0, {
        args: [`https://api.github.com/repos/username/reponame`],
      });

      assertSpyCall(unzipStub, 0, {
        args: [`https://api.github.com/repositories/repo_id/zipball/`],
      });

      assertEquals(manifest, {
        // deno-lint-ignore no-explicit-any
        repo: { id: 'repo_id' } as any,
        manifest: { id: 'manifest }' },
      });
    } finally {
      fetchStub.restore();
      unzipStub.restore();
    }
  });

  await test.step('populate relations', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () =>
        ({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'repo_id',
            }),
          // deno-lint-ignore no-explicit-any
        }) as any,
    );

    const unzipStub = stub(
      utils,
      'unzip',
      () => ({
        entries: {
          '0': {
            name: 'manifest.json',
            text: (() =>
              Promise.resolve(JSON.stringify({
                id: 'manifest',
                media: {
                  new: [{
                    id: 'media_id',
                    type: MediaType.Anime,
                    title: {
                      english: 'english title',
                    },
                  }],
                },
                characters: {
                  new: [{
                    id: 'character_id',
                    name: {
                      english: 'english name',
                    },
                    media: [{
                      role: CharacterRole.Main,
                      mediaId: 'media_id',
                    }],
                  }],
                },
              }))),
          },
        },
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const manifest = await github.manifest({ url: 'username/reponame' });

      assertSpyCall(fetchStub, 0, {
        args: [`https://api.github.com/repos/username/reponame`],
      });

      assertSpyCall(unzipStub, 0, {
        args: [`https://api.github.com/repositories/repo_id/zipball/`],
      });

      assertEquals(manifest, {
        // deno-lint-ignore no-explicit-any
        repo: { id: 'repo_id' } as any,
        manifest: {
          id: 'manifest',
          characters: {
            new: [
              {
                id: 'character_id',
                name: {
                  english: 'english name',
                },
                media: [
                  {
                    mediaId: 'media_id',
                    role: CharacterRole.Main,
                  },
                ],
              },
            ],
          },
          media: {
            new: [
              {
                id: 'media_id',
                type: MediaType.Anime,
                title: {
                  english: 'english title',
                },
                characters: [
                  {
                    characterId: 'character_id',
                    role: CharacterRole.Main,
                  },
                ],
              },
            ],
          },
        },
      });
    } finally {
      fetchStub.restore();
      unzipStub.restore();
    }
  });

  await test.step('not a JSON file', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () =>
        ({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'repo_id',
            }),
          // deno-lint-ignore no-explicit-any
        }) as any,
    );

    const unzipStub = stub(
      utils,
      'unzip',
      () => ({
        entries: {
          '0': {
            name: 'manifest.json',
            text: (() => Promise.resolve('\/\/\\//\/')),
          },
        },
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      await assertRejects(
        () => github.manifest({ url: 'username/reponame' }),
        NonFetalError,
        '`manifest.json` is not a JSON file',
      );

      assertSpyCall(fetchStub, 0, {
        args: [`https://api.github.com/repos/username/reponame`],
      });

      assertSpyCall(unzipStub, 0, {
        args: [`https://api.github.com/repositories/repo_id/zipball/`],
      });
    } finally {
      fetchStub.restore();
      unzipStub.restore();
    }
  });

  await test.step('no manifest.json', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () =>
        ({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'repo_id',
            }),
          // deno-lint-ignore no-explicit-any
        }) as any,
    );

    const unzipStub = stub(
      utils,
      'unzip',
      () => ({
        entries: {},
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      await assertRejects(
        () => github.manifest({ url: 'username/reponame' }),
        NonFetalError,
        'No `manifest.json` found',
      );

      assertSpyCall(fetchStub, 0, {
        args: [`https://api.github.com/repos/username/reponame`],
      });

      assertSpyCall(unzipStub, 0, {
        args: [`https://api.github.com/repositories/repo_id/zipball/`],
      });
    } finally {
      fetchStub.restore();
      unzipStub.restore();
    }
  });
});
