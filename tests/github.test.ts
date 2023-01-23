import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.173.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.173.0/testing/mock.ts';

import github from '../src/github.ts';

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

  await test.step('with url.git', async () => {
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

  await test.step('invalid name', async () => {
    const url = 'owner/name%83';

    await assertRejects(
      async () => await github.get(url),
      Error,
      'invalid git url: owner/name%83',
    );
  });

  await test.step('invalid url', async () => {
    const url = 'url';

    await assertRejects(
      async () => await github.get(url),
      Error,
      'invalid git url: url',
    );
  });

  await test.step('invalid hostname', async () => {
    const url = 'https://gitlab.com/owner/repo.git';

    await assertRejects(
      async () => await github.get(url),
      Error,
      'invalid git url: https://gitlab.com/owner/repo.git',
    );
  });

  await test.step('invalid protocol', async () => {
    const url = 'git@github.com:owner/repo.git';

    await assertRejects(
      async () => await github.get(url),
      Error,
      'invalid git url: git@github.com:owner/repo.git',
    );
  });

  await test.step('failed to fetch', async () => {
    const url = 'https://github.com/username/reponame';

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: false,
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      await assertRejects(
        async () => await github.get(url),
        Error,
        'failed to fetch repository',
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
        Error,
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
