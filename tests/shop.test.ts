// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/testing/asserts.ts';

import { stub } from '$std/testing/mock.ts';

import shop from '../src/shop.ts';
import config from '../src/config.ts';

Deno.test('/buy', async (test) => {
  await test.step('normal dialog', () => {
    const message = shop.normal({
      userId: 'user_id',
      amount: 1,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=normal=user_id=1',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to spent **1 token** <:remove:1099004424111792158>?',
        }],
      },
    });
  });

  await test.step('normal dialog (plural)', () => {
    const message = shop.normal({
      userId: 'user_id',
      amount: 4,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=normal=user_id=4',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to spent **4 tokens** <:remove:1099004424111792158>?',
        }],
      },
    });
  });

  await test.step('normal confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForPulls: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmNormal({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'q=user_id',
                label: '/q',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You bought **1** pull <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('normal confirmed (plural)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForPulls: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmNormal({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'q=user_id',
                label: '/q',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You bought **5** pulls <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('normal insufficient votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForPulls: {
                ok: false,
                error: 'INSUFFICIENT_TOKENS',
                user: {
                  availableVotes: 9,
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.topggCipher = 123;

    try {
      const message = await shop.confirmNormal({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                label: 'Vote',
                type: 2,
                style: 5,
                url: 'https://top.gg/bot/app_id/vote?ref=7-rm4Ok=&gid=guild_id',
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You need **1 more token** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('normal insufficient votes (plural)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForPulls: {
                ok: false,
                error: 'INSUFFICIENT_TOKENS',
                user: {
                  availableVotes: 5,
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.topggCipher = 123;

    try {
      const message = await shop.confirmNormal({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                label: 'Vote',
                type: 2,
                style: 5,
                url: 'https://top.gg/bot/app_id/vote?ref=7-rm4Ok=&gid=guild_id',
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You need **5 more tokens** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('guaranteed 3*', () => {
    const message = shop.guaranteed({
      userId: 'user_id',
      stars: 3,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=guaranteed=user_id=3',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to spent **4 tokens** <:remove:1099004424111792158> for a **3<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
        }],
      },
    });
  });

  await test.step('guaranteed 4*', () => {
    const message = shop.guaranteed({
      userId: 'user_id',
      stars: 4,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=guaranteed=user_id=4',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to spent **12 tokens** <:remove:1099004424111792158> for a **4<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
        }],
      },
    });
  });

  await test.step('guaranteed 5*', () => {
    const message = shop.guaranteed({
      userId: 'user_id',
      stars: 5,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=guaranteed=user_id=5',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to spent **36 tokens** <:remove:1099004424111792158> for a **5<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
        }],
      },
    });
  });

  await test.step('guaranteed 3* confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 3,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'pull=user_id=3',
                label: '/pull 3',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought a **3**<:smolstar:1107503653956374638>pull <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed 4* confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'pull=user_id=4',
                label: '/pull 4',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought a **4**<:smolstar:1107503653956374638>pull <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed 5* confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'pull=user_id=5',
                label: '/pull 5',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought a **5**<:smolstar:1107503653956374638>pull <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_TOKENS',
                user: {
                  availableVotes: 11,
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.topggCipher = 123;

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                label: 'Vote',
                type: 2,
                style: 5,
                url: 'https://top.gg/bot/app_id/vote?ref=7-rm4Ok=&gid=guild_id',
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You need **1 more token** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes (plural)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeTokensForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_TOKENS',
                user: {
                  availableVotes: 5,
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.topggCipher = 123;

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                label: 'Vote',
                type: 2,
                style: 5,
                url: 'https://top.gg/bot/app_id/vote?ref=7-rm4Ok=&gid=guild_id',
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You need **7 more tokens** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.topggCipher;

      fetchStub.restore();
    }
  });
});
