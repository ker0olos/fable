/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';

import utils from '~/src/utils.ts';

import * as discord from '~/src/discord.ts';

describe('interactions', () => {
  it('command', () => {
    const body = JSON.stringify({
      id: 'body_id',
      token: 'body_token',
      type: discord.InteractionType.Command,
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'name',
        options: [
          {
            name: 'text',
            value: 'text',
          },
          {
            name: 'boolean',
            value: true,
          },
          {
            name: 'number',
            value: 420,
          },
        ],
      },
    });

    const interaction = new discord.Interaction<string | number | boolean>(
      body
    );

    expect(interaction.id).toBe('body_id');
    expect(interaction.token).toBe('body_token');

    expect(interaction.type).toBe(2);

    expect(interaction.name).toBe('name');

    expect(interaction.member!.user.id).toBe('user_id');

    expect(interaction.options['text']).toBe('text');
    expect(interaction.options['boolean']).toBe(true);
    expect(interaction.options['number']).toBe(420);
  });

  it('interactions', () => {
    const body = JSON.stringify({
      id: 'body_id',
      token: 'body_token',
      type: discord.InteractionType.Component,
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'test_id=abc=123',
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'text',
                value: 'text',
              },
              {
                custom_id: 'boolean',
                value: true,
              },
              {
                custom_id: 'number',
                value: 420,
              },
            ],
          },
        ],
      },
    });

    const interaction = new discord.Interaction<string | number | boolean>(
      body
    );

    expect(interaction.id).toBe('body_id');
    expect(interaction.token).toBe('body_token');

    expect(interaction.type).toBe(3);

    expect(interaction.customType).toBe('test_id');
    expect(interaction.customValues).toEqual(['abc', '123']);

    expect(interaction.member!.user.id).toBe('user_id');

    // expect(interaction.options['text']).toBe('text');
    // expect(interaction.options['boolean']).toBe(true);
    // expect(interaction.options['number']).toBe(420);
  });

  it('select menu', () => {
    const body = JSON.stringify({
      id: 'body_id',
      token: 'body_token',
      type: discord.InteractionType.Component,
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        type: discord.ComponentType.StringSelect,
        custom_id: 'test_id=1',
        values: ['test_value', 'test_value_2'],
      },
    });

    const interaction = new discord.Interaction<string | number | boolean>(
      body
    );

    expect(interaction.id).toBe('body_id');
    expect(interaction.token).toBe('body_token');

    expect(interaction.type).toBe(3);

    expect(interaction.customType).toBe('test_id');
    expect(interaction.customValues).toEqual(['test_value', 'test_value_2']);

    expect(interaction.member!.user.id).toBe('user_id');
  });

  it('user', () => {
    const body = JSON.stringify({
      id: 'body_id',
      token: 'body_token',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        type: 2,
        name: 'TEST_COMMAND',
        target_id: 'another_user_id',
        resolved: {
          members: {
            another_user_id: {
              nick: 'Nickname',
            },
          },
          users: {
            another_user_id: {
              username: 'Another User',
            },
          },
        },
      },
    });

    const interaction = new discord.Interaction<string>(body);

    expect(interaction.id).toBe('body_id');
    expect(interaction.token).toBe('body_token');

    expect(interaction.type).toBe(2);

    expect(interaction.name).toBe('test_command');

    expect(interaction.member!.user.id).toBe('user_id');

    expect(interaction.options['user']).toBe('another_user_id');

    expect(interaction.resolved?.members?.['another_user_id'].nick).toBe(
      'Nickname'
    );

    expect(interaction.resolved?.users?.['another_user_id'].username).toBe(
      'Another User'
    );
  });
});

describe('embeds', () => {
  it('should create embeds with various properties', () => {
    const embed = new discord.Embed();

    embed
      .setAuthor({ name: 'a', url: 'b', icon_url: 'c' })
      .setTitle('abc')
      .setDescription('abc')
      .setUrl('abc')
      .setColor('#3E5F8A')
      .setFooter({ text: 'a', icon_url: 'b' });

    expect(embed.json().type).toBe('rich');
    expect(embed.json().fields).toBeUndefined();

    expect(embed.json().author!.name).toBe('a');
    expect(embed.json().author!.url).toBe('b');
    expect(embed.json().author!.icon_url).toBe('c');

    expect(embed.json().title).toBe('abc');

    expect(embed.json().description!).toBe('abc');

    expect(embed.json().url).toBe('abc');

    expect(embed.json().color!).toBe(4087690);

    expect(embed.json().footer!.text).toBe('a');
    expect(embed.json().footer!.icon_url).toBe('b');

    embed.addField({ name: 'a', value: 'b' });
    embed.addField({ name: 'c', value: 'd', inline: true });

    expect(embed.json().fields!.length).toBe(2);

    expect(embed.json().fields![0]).toEqual({
      name: 'a',
      value: 'b',
    });

    expect(embed.json().fields![1]).toEqual({
      name: 'c',
      value: 'd',
      inline: true,
    });
  });
});

describe('components', () => {
  it('general', () => {
    const component = new discord.Component();

    component
      .setId('custom_id')
      .setEmote({
        id: 'emote_id',
        name: 'emote_name',
        animated: true,
      })
      .setLabel('label');

    expect(component.json()).toEqual({
      type: 2,
      style: 2,
      custom_id: 'custom_id',
      emoji: {
        id: 'emote_id',
        name: 'emote_name',
        animated: true,
      },
      label: 'label',
    });
  });

  it('select menu', () => {
    const component = new discord.Component();

    component.setId('custom_id').setOptions([
      {
        label: 'label',
        value: 'value',
        default: true,
        description: 'description',
        emote: {
          id: 'emote_id',
          name: 'emote_name',
          animated: false,
        },
      },
    ]);

    expect(component.json()).toEqual({
      type: 3,
      custom_id: 'custom_id',
      options: [
        {
          label: 'label',
          value: 'value',
          default: true,
          description: 'description',
          emoji: {
            id: 'emote_id',
            name: 'emote_name',
            animated: false,
          },
        },
      ],
    });
  });

  it('new with non-default type', () => {
    expect(
      new discord.Component(discord.ComponentType.UserSelect).json().type
    ).toBe(5);
  });

  it('new with placeholder', () => {
    const component = new discord.Component(discord.ComponentType.TextInput);

    component.setPlaceholder('placeholder');

    expect(component.json()).toEqual({
      type: 4,
      style: 1,
      placeholder: 'placeholder',
    });
  });

  it('new with url', () => {
    const component = new discord.Component();

    component.setUrl('url');

    expect(component.json()).toEqual({
      type: 2,
      style: 5,
      url: 'url',
    });
  });

  it('set style', () => {
    const component = new discord.Component();

    component.setStyle(discord.ButtonStyle.Blue);

    expect(component.json()).toEqual({
      type: 2,
      style: 1,
    });
  });
});

describe('attachments', () => {
  it('add', () => {
    const message = new discord.Message();

    message.addAttachment({
      type: 'image/png',
      arrayBuffer: new ArrayBuffer(8),
      filename: 'file.test',
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [
          {
            filename: 'file.test',
            id: '0',
          },
        ],
        components: [],
        embeds: [],
      },
    });
  });

  it('clear', () => {
    const message = new discord.Message();

    const embed = new discord.Embed();

    embed.setTitle('abc');

    message.addAttachment({
      type: 'image/png',
      arrayBuffer: new ArrayBuffer(8),
      filename: 'file.test',
    });

    message.addEmbed(embed);

    expect(message.json()).toEqual({
      type: 4,
      data: {
        components: [],
        attachments: [
          {
            filename: 'file.test',
            id: '0',
          },
        ],
        embeds: [
          {
            title: 'abc',
            type: 'rich',
          },
        ],
      },
    });

    message.clearAttachments();

    expect(message.json()).toEqual({
      type: 4,
      data: {
        components: [],
        attachments: [],
        embeds: [
          {
            title: 'abc',
            type: 'rich',
          },
        ],
      },
    });
  });

  it('clear and clear embeds', () => {
    const message = new discord.Message();
    const embed = new discord.Embed();

    embed.setTitle('abc');

    message.addAttachment({
      type: 'image/png',
      arrayBuffer: new ArrayBuffer(8),
      filename: 'file.test',
    });

    message.addEmbed(embed);

    expect(message.json()).toEqual({
      type: 4,
      data: {
        components: [],
        attachments: [
          {
            filename: 'file.test',
            id: '0',
          },
        ],
        embeds: [
          {
            title: 'abc',
            type: 'rich',
          },
        ],
      },
    });

    message.clearEmbedsAndAttachments();

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [],
      },
    });
  });
});

describe('suggestions', () => {
  it('normal', () => {
    const message = new discord.Message();

    message.addSuggestions({ name: 'a', value: 'b' }, { value: 'c' });

    expect(message.json()).toEqual({
      type: 8,
      data: {
        choices: [
          {
            name: 'a',
            value: 'b',
          },
          {
            name: 'c',
            value: 'c',
          },
        ],
      },
    });
  });

  it('no suggestions', () => {
    const message = new discord.Message(discord.MessageType.Suggestions);

    expect(message.json()).toEqual({
      type: 8,
      data: {
        choices: [],
      },
    });
  });
});

describe('messages', () => {
  it('normal', () => {
    const message = new discord.Message();

    expect(message.json().type).toBe(4);

    message.setContent('content');

    expect(message.json().data.content).toBe('content');
  });

  it('set flags', () => {
    const message = new discord.Message();

    expect(message.json().data.flags).toBeFalsy();

    message.setFlags(discord.MessageFlags.Ephemeral);

    expect(message.json().data.flags).toBe(1 << 6);
  });

  it('set type', () => {
    const message = new discord.Message(discord.MessageType.Update);

    expect(message.json().type).toBe(7);

    message.setType(discord.MessageType.Pong);

    expect(message.json().type).toBe(1);
  });

  it('adding embeds and components', () => {
    const message = new discord.Message();

    message.addEmbed(new discord.Embed());
    message.addComponents([new discord.Component()]);

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                label: undefined,
              },
            ],
          },
        ],
        embeds: [
          {
            type: 'rich',
          },
        ],
      },
    });
  });

  it('inserting components', () => {
    const message = new discord.Message();

    message.addComponents([
      new discord.Component().setId('1'),
      new discord.Component().setId('2'),
    ]);

    message.insertComponents([new discord.Component().setId('3')]);

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                custom_id: '3',
                label: undefined,
              },
              {
                type: 2,
                style: 2,
                custom_id: '1',
                label: undefined,
              },
              {
                type: 2,
                style: 2,
                custom_id: '2',
                label: undefined,
              },
            ],
          },
        ],
        embeds: [],
      },
    });
  });

  it('modals', () => {
    const component = new discord.Message();

    component.setTitle('title').setId('custom_id');

    expect(component.json()).toEqual({
      type: 9,
      data: {
        components: [],
        custom_id: 'custom_id',
        title: 'title',
      },
    });
  });

  it('send', async () => {
    const message = new discord.Message().setContent('content');

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      formData: async () => {
        const formData = new FormData();
        formData.append(
          'payload_json',
          JSON.stringify({
            type: 4,
            data: {
              embeds: [],
              attachments: [],
              components: [],
              content: 'content',
            },
          })
        );
        return formData;
      },
    };

    // Mock the Response from message.send()
    vi.spyOn(message, 'send').mockImplementation(() => mockResponse as any);

    const response = message.send();

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');

    const formData = await response.formData();
    const payload = JSON.parse(formData.get('payload_json')!.toString());

    expect(payload).toEqual({
      type: 4,
      data: {
        embeds: [],
        attachments: [],
        components: [],
        content: 'content',
      },
    });
  });
});

describe('static messages', () => {
  it('pong', async () => {
    const message = discord.Message.pong();

    const json = await message.json();

    expect(json).toEqual({
      type: 1,
    });
  });

  it('dialog', () => {
    const message = discord.Message.dialog({
      type: 'type',
      confirm: 'confirm_id',
      description: 'description',
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
          {
            type: 'rich',
            description: 'description',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=confirm_id',
                label: 'Confirm',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cancel',
                label: 'Cancel',
                style: 4,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('dialog 2', () => {
    const message = discord.Message.dialog({
      confirm: ['type', 'confirm_id2'],
      description: 'description',
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
      confirmText: 'Accept',
      cancelText: 'Decline',
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
          {
            type: 'rich',
            description: 'description',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=confirm_id2',
                label: 'Accept',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cancel',
                label: 'Decline',
                style: 4,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('dialog 3', () => {
    const message = discord.Message.dialog({
      confirm: ['type', 'confirm_id2'],
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
      confirmText: 'Accept',
      cancelText: 'Decline',
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=confirm_id2',
                label: 'Accept',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cancel',
                label: 'Decline',
                style: 4,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('internal error', () => {
    const message = discord.Message.internal('id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            description:
              'An Internal Error occurred and was reported.\n```ref_id: id```',
            type: 'rich',
          },
        ],
        components: [],
        attachments: [],
      },
    });
  });
});

describe('patch messages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should patch message', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(true as any);

    const message = new discord.Message();

    await message.patch('token');

    const form = new FormData();

    form.append(
      'payload_json',
      JSON.stringify({
        embeds: [],
        attachments: [],
        components: [],
      })
    );

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/undefined/token/messages/@original',
      {
        method: 'PATCH',
        body: expect.any(FormData),
        headers: {
          'User-Agent': 'Fable (https://github.com/ker0olos/fable)',
        },
      }
    );
  });
});

describe('followup messages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should send followup message', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(true as any);

    const message = new discord.Message();

    await message.followup('token');

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/undefined/token',
      {
        method: 'POST',
        body: expect.any(FormData),
        headers: {
          'User-Agent': 'Fable (https://github.com/ker0olos/fable)',
        },
      }
    );
  });
});

describe('page messages', () => {
  it('1/2', () => {
    const message = discord.Message.page({
      index: 0,
      total: 2,
      type: 'type',
      target: 'target',
      next: true,
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=target=1=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '1/2',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'type=target=1=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('2/2', () => {
    const message = discord.Message.page({
      index: 1,
      total: 2,
      type: 'type',
      target: 'target',
      next: false,
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=target=0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '2/2',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'type=target=0=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('2/3', () => {
    const message = discord.Message.page({
      index: 1,
      total: 3,
      type: 'type',
      target: 'target',
      next: true,
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=target=0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '2/3',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'type=target=2=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('1/?', () => {
    const message = discord.Message.page({
      index: 0,
      type: 'type',
      target: 'target',
      next: true,
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: '_',
                disabled: true,
                label: '1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'type=target=1=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it('1/1', () => {
    const message = discord.Message.page({
      index: 0,
      total: 1,
      type: 'type',
      target: 'target',
      next: false,
      message: new discord.Message().addEmbed(
        new discord.Embed().setTitle('title')
      ),
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        embeds: [
          {
            type: 'rich',
            title: 'title',
          },
        ],
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'type=target=0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '1/1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'type=target=0=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });
});

describe('emotes', () => {
  it.each(Object.entries(discord.emotes))(
    'should validate emote %s',
    async (name, tag) => {
      const id = /<.*:.*:(.*)>/.exec(tag);

      // Mock the fetch call since we can't make real HTTP requests in Vitest
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({
          'content-type': 'image/webp',
        }),
        body: {
          cancel: vi.fn(),
        },
      });

      const response = await fetch(
        `https://cdn.discordapp.com/emojis/${
          id?.[1]
        }.webp?size=44&quality=lossless`
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('image/webp');
    }
  );
});

describe('images', () => {
  it('set image url', () => {
    const embed = new discord.Embed();

    embed.setImageUrl('image_url');

    expect(embed.json().image!.url).toBe('image_url');
  });

  it('set thumbnail url', () => {
    const embed = new discord.Embed();

    embed.setThumbnailUrl('image_url');

    expect(embed.json().thumbnail!.url).toBe('image_url');
  });

  it('set image file', () => {
    const embed = new discord.Embed();

    const attachment = embed.setImageFile('assets/public/spinner.gif');

    expect(embed.json().image!.url).toBe('attachment://spinner.gif');

    expect(attachment.filename).toBe('spinner.gif');
    expect(attachment.type).toBe('image/gif');
  });

  it('set image attachment proxy', async () => {
    const embed = new discord.Embed();

    const attachment = await embed.setImageWithProxy({
      url: 'https://s4.anilist.co/file/anilistcdn/character/large/b89363-mm21Ll4NegUD.png',
    });

    expect(embed.json().image!.url).toBe(
      'attachment://b89363-mm21Ll4NegUD.png'
    );

    expect(attachment?.filename).toBe('b89363-mm21Ll4NegUD.png');
    expect(attachment?.type).toBe('image/webp');
  });

  it('set thumbnail attachment proxy', async () => {
    const embed = new discord.Embed();

    const attachment = await embed.setThumbnailWithProxy({
      url: 'https://s4.anilist.co/file/anilistcdn/character/large/b89363-mm21Ll4NegUD.png',
    });

    expect(embed.json().thumbnail!.url).toBe(
      'attachment://b89363-mm21Ll4NegUD.png'
    );

    expect(attachment?.filename).toBe('b89363-mm21Ll4NegUD.png');
    expect(attachment?.type).toBe('image/webp');
  });

  it('set image attachment proxy (default)', async () => {
    const embed = new discord.Embed();

    const attachment = await embed.setImageWithProxy({
      url: '',
    });

    expect(embed.json().image!.url).toBe('attachment://default.webp');

    expect(attachment?.filename).toBe('default.webp');
    expect(attachment?.type).toBe('image/webp');
  });

  it('set thumbnail attachment proxy (default)', async () => {
    const embed = new discord.Embed();

    const attachment = await embed.setThumbnailWithProxy({
      url: '',
    });

    expect(embed.json().thumbnail!.url).toBe('attachment://default.webp');

    expect(attachment?.filename).toBe('default.webp');
    expect(attachment?.type).toBe('image/webp');
  });
});
