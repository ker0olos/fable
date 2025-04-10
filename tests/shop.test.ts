/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, afterEach } from 'vitest';

import shop from '~/src/shop.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';
import { NonFetalError } from '~/src/errors.ts';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/buy pulls', () => {
  test('normal dialog', () => {
    config.shop = true;

    try {
      const message = shop.normal({
        userId: 'user_id',
        amount: 1,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You want to spent **1 token** <:remove:1099004424111792158>?',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('normal dialog (plural)', () => {
    config.shop = true;

    try {
      const message = shop.normal({
        userId: 'user_id',
        amount: 4,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You want to spent **4 tokens** <:remove:1099004424111792158>?',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('normal confirmed', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addPullsSpy = vi.spyOn(db, 'addPulls').mockReturnValue('_' as any);

    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      expect(addPullsSpy).toHaveBeenCalledWith('user_id', 'guild_id', 1);

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description: 'You bought **1** pull <:add:1099004747123523644>',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('normal confirmed (plural)', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addPullsSpy = vi.spyOn(db, 'addPulls').mockReturnValue('_' as any);

    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 5,
      });

      expect(addPullsSpy).toHaveBeenCalledWith('user_id', 'guild_id', 5);

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description: 'You bought **5** pulls <:add:1099004747123523644>',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('normal insufficient tokens', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue({
      availableTokens: 9,
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'addPulls').mockImplementation(() => {
      throw new Error('INSUFFICIENT_TOKENS');
    });

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'You need **1 more token** before you can do this.',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;
    }
  });

  test('normal insufficient tokens (plural)', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue({
      availableTokens: 5,
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'addPulls').mockImplementation(() => {
      throw new Error('INSUFFICIENT_TOKENS');
    });

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmNormal({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'You need **5 more tokens** before you can do this.',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;
    }
  });

  test('under maintenance', () => {
    config.shop = false;

    try {
      expect(() =>
        shop.normal({
          userId: 'user_id',
          amount: 1,
        })
      ).toThrow(NonFetalError);

      expect(() =>
        shop.normal({
          userId: 'user_id',
          amount: 1,
        })
      ).toThrow('Shop is under maintenance, try again later!');
    } finally {
      delete config.shop;
    }
  });
});

describe('/buy guaranteed', () => {
  test('guaranteed 3*', () => {
    config.shop = true;

    try {
      const message = shop.guaranteed({
        userId: 'user_id',
        stars: 3,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You want to spent **4 tokens** <:remove:1099004424111792158> for a **3<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('guaranteed 4*', () => {
    config.shop = true;

    try {
      const message = shop.guaranteed({
        userId: 'user_id',
        stars: 4,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You want to spent **12 tokens** <:remove:1099004424111792158> for a **4<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('guaranteed 5*', () => {
    config.shop = true;

    try {
      const message = shop.guaranteed({
        userId: 'user_id',
        stars: 5,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
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
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You want to spent **28 tokens** <:remove:1099004424111792158> for a **5<:smolstar:1107503653956374638>**<:add:1099004747123523644>?',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('guaranteed 3* confirmed', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addGuaranteeSpy = vi
      .spyOn(db, 'addGuarantee')
      .mockReturnValue('_' as any);

    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 3,
      });

      expect(addGuaranteeSpy).toHaveBeenCalledWith('user_id', 3);

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'pull=user_id=3',
                  label: '/pull 3',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You bought a **3**<:smolstar:1107503653956374638>pull <:add:1099004747123523644>',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('guaranteed 4* confirmed', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addGuaranteeSpy = vi
      .spyOn(db, 'addGuarantee')
      .mockReturnValue('_' as any);

    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      expect(addGuaranteeSpy).toHaveBeenCalledWith('user_id', 4);

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'pull=user_id=4',
                  label: '/pull 4',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You bought a **4**<:smolstar:1107503653956374638>pull <:add:1099004747123523644>',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('guaranteed 5* confirmed', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addGuaranteeSpy = vi
      .spyOn(db, 'addGuarantee')
      .mockReturnValue('_' as any);

    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 5,
      });

      expect(addGuaranteeSpy).toHaveBeenCalledWith('user_id', 5);

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'pull=user_id=5',
                  label: '/pull 5',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              description:
                'You bought a **5**<:smolstar:1107503653956374638>pull <:add:1099004747123523644>',
            },
          ],
        },
      });
    } finally {
      delete config.shop;
    }
  });

  test('guaranteed insufficient tokens', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue({
      availableTokens: 11,
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'addGuarantee').mockImplementation(() => {
      throw new Error('INSUFFICIENT_TOKENS');
    });

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'You need **1 more token** before you can do this.',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;
    }
  });

  test('guaranteed insufficient tokens (plural)', async () => {
    vi.spyOn(db, 'getUser').mockReturnValue({
      availableTokens: 5,
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'addGuarantee').mockImplementation(() => {
      throw new Error('INSUFFICIENT_TOKENS');
    });

    config.appId = 'app_id';
    config.shop = true;

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'You need **7 more tokens** before you can do this.',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.shop;
    }
  });
});
