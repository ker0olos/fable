// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.186.0/testing/asserts.ts';

import { stub } from 'https://deno.land/std@0.186.0/testing/mock.ts';

import shop from '../src/shop.ts';

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
            'Are you sure you want to spent **1** vote <:remove:1099004424111792158>',
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
            'Are you sure you want to spent **4** votes <:remove:1099004424111792158>',
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
              exchangeVotesForPulls: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmNormal({
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
              exchangeVotesForPulls: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmNormal({
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

  await test.step('normal no votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForPulls: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {},
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmNormal({
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
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You don\'t have any votes',
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
              exchangeVotesForPulls: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 1,
                },
              },
            },
          }))),
      } as any),
    );

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
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **1** vote',
          }],
        },
      });
    } finally {
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
              exchangeVotesForPulls: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 5,
                },
              },
            },
          }))),
      } as any),
    );

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
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **5** votes',
          }],
        },
      });
    } finally {
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
            'Are you sure you want to spent **4** votes <:remove:1099004424111792158>',
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
            'Are you sure you want to spent **12** votes <:remove:1099004424111792158>',
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
            'Are you sure you want to spent **36** votes <:remove:1099004424111792158>',
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
              exchangeVotesForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
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
              exchangeVotesForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
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
              exchangeVotesForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
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

  await test.step('guaranteed no votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {},
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
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
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You don\'t have any votes',
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
              exchangeVotesForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 1,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
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
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **1** vote',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes (plural', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 5,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
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
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **5** votes',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });
});
