// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { assertSpyCallArgs, stub } from '$std/testing/mock.ts';

import shop from '../src/shop.ts';

import config from '../src/config.ts';

import db from '../db/mod.ts';

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
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPullsStub = stub(
      db,
      'addPulls',
      () => '_' as any,
    );

    try {
      const message = await shop.confirmNormal({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'instance',
        'user',
        1,
      ]);

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
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('normal confirmed (plural)', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPullsStub = stub(
      db,
      'addPulls',
      () => '_' as any,
    );

    try {
      const message = await shop.confirmNormal({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 5,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'instance',
        'user',
        5,
      ]);

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
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('normal insufficient votes', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 9,
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPullsStub = stub(
      db,
      'addPulls',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

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
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
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

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addPullsStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('normal insufficient votes (plural)', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 5,
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPullsStub = stub(
      db,
      'addPulls',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

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
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
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

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addPullsStub.restore();
      createVoteRefStub.restore();
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
            'You want to spent **28 tokens** <:remove:1099004424111792158> for a **5<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
        }],
      },
    });
  });

  await test.step('guaranteed 3* confirmed', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => '_' as any,
    );

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 3,
      });

      assertSpyCallArgs(addGuaranteeStub, 0, [
        'user',
        3,
      ]);

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
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addGuaranteeStub.restore();
    }
  });

  await test.step('guaranteed 4* confirmed', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => '_' as any,
    );

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 4,
      });

      assertSpyCallArgs(addGuaranteeStub, 0, [
        'user',
        4,
      ]);

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
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addGuaranteeStub.restore();
    }
  });

  await test.step('guaranteed 5* confirmed', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => '_' as any,
    );

    try {
      const message = await shop.confirmGuaranteed({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertSpyCallArgs(addGuaranteeStub, 0, [
        'user',
        5,
      ]);

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
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addGuaranteeStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 11,
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

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
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
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

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addGuaranteeStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes (plural)', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 5,
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

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
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
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

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      addGuaranteeStub.restore();
      createVoteRefStub.restore();
    }
  });
});
