// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.183.0/testing/asserts.ts';

import { stub } from 'https://deno.land/std@0.183.0/testing/mock.ts';

import shop from '../src/shop.ts';

Deno.test('/buy', async (test) => {
  await test.step('random dialog', () => {
    const message = shop.random({
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
              custom_id: 'buy=random=user_id=1',
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
            'Are you sure you want to spent **1** vote <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('random dialog (plural)', () => {
    const message = shop.random({
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
              custom_id: 'buy=random=user_id=4',
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
            'Are you sure you want to spent **4** votes <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('random confirmed', async () => {
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
      const message = await shop.confirmRandom({
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
            description:
              'You bought **1** random pull <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('random confirmed (plural)', async () => {
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
      const message = await shop.confirmRandom({
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
            description:
              'You bought **5** random pulls <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('random no votes', async () => {
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
      const message = await shop.confirmRandom({
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

  await test.step('random insufficient votes', async () => {
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
      const message = await shop.confirmRandom({
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

  await test.step('random insufficient votes (plural)', async () => {
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
      const message = await shop.confirmRandom({
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
            'Are you sure you want to spent **4** votes <:remove:1085033678180208641>',
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
            'Are you sure you want to spent **12** votes <:remove:1085033678180208641>',
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
            'Are you sure you want to spent **36** votes <:remove:1085033678180208641>',
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
              'You bought a **3**<:smol_star:1088427421096751224>pull <:add:1085034731810332743>',
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
              'You bought a **4**<:smol_star:1088427421096751224>pull <:add:1085034731810332743>',
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
              'You bought a **5**<:smol_star:1088427421096751224>pull <:add:1085034731810332743>',
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
