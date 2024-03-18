// deno-lint-ignore-file no-explicit-any

import { assertEquals, assertThrows } from '$std/assert/mod.ts';

import { assertSpyCallArgs, stub } from '$std/testing/mock.ts';

import shop from '~/src/shop.ts';

import config from '~/src/config.ts';

import db from '~/db/mod.ts';

import { NonFetalError } from '~/src/errors.ts';

Deno.test('/buy pulls', async (test) => {
  await test.step('normal dialog', () => {
    config.shop = true;

    try {
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
    } finally {
      delete config.shop;
    }
  });

  await test.step('normal dialog (plural)', () => {
    config.shop = true;

    try {
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
    } finally {
      delete config.shop;
    }
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

    const addPullsStub = stub(
      db,
      'addPulls',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'user_id',
        'guild_id',
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
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
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

    const addPullsStub = stub(
      db,
      'addPulls',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 5,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'user_id',
        'guild_id',
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
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('normal insufficient tokens', async () => {
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

    const addPullsStub = stub(
      db,
      'addPulls',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'You need **1 more token** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('normal insufficient tokens (plural)', async () => {
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

    const addPullsStub = stub(
      db,
      'addPulls',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'You need **5 more tokens** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('under maintenance', () => {
    config.shop = false;

    try {
      assertThrows(
        () =>
          shop.normal({
            userId: 'user_id',
            amount: 1,
          }),
        NonFetalError,
        'Shop is under maintenance, try again later!',
      );
    } finally {
      delete config.shop;
    }
  });
});

Deno.test('/buy guaranteed', async (test) => {
  await test.step('guaranteed 3*', () => {
    config.shop = true;

    try {
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
    } finally {
      delete config.shop;
    }
  });

  await test.step('guaranteed 4*', () => {
    config.shop = true;

    try {
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
    } finally {
      delete config.shop;
    }
  });

  await test.step('guaranteed 5*', () => {
    config.shop = true;

    try {
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
    } finally {
      delete config.shop;
    }
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

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 3,
      });

      assertSpyCallArgs(addGuaranteeStub, 0, [
        'user_id',
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
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
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

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertSpyCallArgs(addGuaranteeStub, 0, [
        'user_id',
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
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
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

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 5,
      });

      assertSpyCallArgs(addGuaranteeStub, 0, [
        'user_id',
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
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addGuaranteeStub.restore();
    }
  });

  await test.step('guaranteed insufficient tokens', async () => {
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

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'You need **1 more token** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addGuaranteeStub.restore();
    }
  });

  await test.step('guaranteed insufficient tokens (plural)', async () => {
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

    const addGuaranteeStub = stub(
      db,
      'addGuarantee',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'You need **7 more tokens** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addGuaranteeStub.restore();
    }
  });
});

Deno.test('/buy keys', async (test) => {
  await test.step('keys dialog', () => {
    config.shop = true;

    try {
      const message = shop.keys({
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
                custom_id: 'buy=keys=user_id=1',
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
    } finally {
      delete config.shop;
    }
  });

  await test.step('keys dialog (plural)', () => {
    config.shop = true;

    try {
      const message = shop.keys({
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
                custom_id: 'buy=keys=user_id=4',
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
    } finally {
      delete config.shop;
    }
  });

  await test.step('keys confirmed', async () => {
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

    const addPullsStub = stub(
      db,
      'addKeys',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmKeys({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'user_id',
        'guild_id',
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
                custom_id: 'tchallenge=user_id',
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear=user_id',
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You bought **1** key <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('keys confirmed (plural)', async () => {
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

    const addPullsStub = stub(
      db,
      'addKeys',
      () => '_' as any,
    );

    config.shop = true;

    try {
      const message = await shop.confirmKeys({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 4,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'user_id',
        'guild_id',
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
                custom_id: 'tchallenge=user_id',
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear=user_id',
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You bought **4** keys <:add:1099004747123523644>',
          }],
        },
      });
    } finally {
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('keys insufficient tokens', async () => {
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

    const addPullsStub = stub(
      db,
      'addKeys',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmKeys({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'You need **1 more token** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('keys insufficient tokens (plural)', async () => {
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

    const addPullsStub = stub(
      db,
      'addKeys',
      () => {
        throw new Error('INSUFFICIENT_TOKENS');
      },
    );

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmKeys({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'You need **5 more tokens** before you can do this.',
          }],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;

      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });
});
