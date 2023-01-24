// deno-lint-ignore-file no-non-null-assertion

import {
  assert,
  assertEquals,
} from 'https://deno.land/std@0.173.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.173.0/testing/mock.ts';

import * as discord from '../src/discord.ts';

Deno.test('interactions', async (test) => {
  await test.step('command', () => {
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
        options: [{
          name: 'text',
          value: 'text',
        }, {
          name: 'boolean',
          value: true,
        }, {
          name: 'number',
          value: 420,
        }],
      },
    });

    const interaction = new discord.Interaction<string | number | boolean>(
      body,
    );

    assertEquals(interaction.id, 'body_id');
    assertEquals(interaction.token, 'body_token');

    assertEquals(interaction.type, 2);

    assertEquals(interaction.name, 'name');

    assertEquals(interaction.member!.user.id, 'user_id');

    assertEquals(interaction.options['text'], 'text');
    assertEquals(interaction.options['boolean'], true);
    assertEquals(interaction.options['number'], 420);
  });

  await test.step('interactions', () => {
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
        components: [{
          type: 1,
          components: [{
            custom_id: 'text',
            value: 'text',
          }, {
            custom_id: 'boolean',
            value: true,
          }, {
            custom_id: 'number',
            value: 420,
          }],
        }],
      },
    });

    const interaction = new discord.Interaction<string | number | boolean>(
      body,
    );

    assertEquals(interaction.id, 'body_id');
    assertEquals(interaction.token, 'body_token');

    assertEquals(interaction.type, 3);

    assertEquals(interaction.customType, 'test_id');
    assertEquals(interaction.customValues, ['abc', '123']);

    assertEquals(interaction.member!.user.id, 'user_id');

    assertEquals(interaction.options['text'], 'text');
    assertEquals(interaction.options['boolean'], true);
    assertEquals(interaction.options['number'], 420);
  });
});

// why are embeds test and  components test set up differently?
// because embeds can contain all parameters
// while components have parameters that can't overlap

Deno.test('embeds', async (test) => {
  const embed = new discord.Embed();

  embed
    .setAuthor({ name: 'a', url: 'b', icon_url: 'c' })
    .setTitle('abc')
    .setDescription('abc')
    .setUrl('abc')
    .setColor('#3E5F8A')
    .setThumbnail({ url: 'abc' })
    .setImage({ url: 'abc' })
    .setFooter({ text: 'a', icon_url: 'b' });

  assertEquals(embed.json().type, 'rich');
  assertEquals(embed.json().fields, undefined);

  await test.step('author', () => {
    assertEquals(embed.json().author!.name, 'a');
    assertEquals(embed.json().author!.url, 'b');
    assertEquals(embed.json().author!.icon_url, 'c');
  });

  await test.step('title', () => {
    assertEquals(embed.json().title, 'abc');
  });

  await test.step('description', () => {
    assertEquals(embed.json().description!, 'abc');
  });

  await test.step('url', () => {
    assertEquals(embed.json().url, 'abc');
  });

  await test.step('color', () => {
    assertEquals(embed.json().color!, 4087690);
  });

  await test.step('thumbnail', () => {
    assertEquals(
      embed.json().thumbnail!.url,
      'undefined/external/abc?size=thumbnail',
    );
  });

  await test.step('image', () => {
    assertEquals(
      embed.json().image!.url,
      'undefined/external/abc',
    );
  });

  await test.step('fields', () => {
    embed.addField({ name: 'a', value: 'b' });
    embed.addField({ name: 'c', value: 'd', inline: true });

    assertEquals(embed.json().fields!.length, 2);

    assertEquals(embed.json().fields![0], {
      name: 'a',
      value: 'b',
    });

    assertEquals(embed.json().fields![1], {
      name: 'c',
      value: 'd',
      inline: true,
    });
  });

  await test.step('footer', () => {
    assertEquals(embed.json().footer!.text, 'a');
    assertEquals(embed.json().footer!.icon_url, 'b');
  });
});

Deno.test('components', async (test) => {
  const component = new discord.Component();

  component
    .setId('custom_id')
    .setEmote({
      id: 'emote_id',
      name: 'emote_name',
      animated: true,
    })
    .setLabel('label');

  assertEquals(component.json(), {
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

  await test.step('new with non-default type', () => {
    assertEquals(
      new discord.Component(discord.ComponentType.UserSelect).json().type,
      5,
    );
  });

  await test.step('new with placeholder', () => {
    const component = new discord.Component(discord.ComponentType.TextInput);

    component.setPlaceholder('placeholder');

    assertEquals(component.json(), {
      type: 4,
      style: 1,
      placeholder: 'placeholder',
    });
  });

  await test.step('new with url', () => {
    const component = new discord.Component();

    component.setUrl('url');

    assertEquals(component.json(), {
      type: 2,
      style: 5,
      url: 'url',
    });
  });

  await test.step('set style', () => {
    const component = new discord.Component();

    component.setStyle(discord.ButtonStyle.Blue);

    assertEquals(component.json(), {
      type: 2,
      style: 1,
    });
  });
});

Deno.test('messages', async (test) => {
  const message = new discord.Message();

  message.addEmbed(new discord.Embed());
  message.addComponents([new discord.Component()]);

  assertEquals(message.json(), {
    type: 4,
    data: {
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 2,
          label: undefined,
        }],
      }],
      embeds: [{
        type: 'rich',
      }],
    },
  });

  await test.step('normal', () => {
    const message = new discord.Message();

    assertEquals(message.json().type, 4);

    message.setContent('content');

    assertEquals(message.json().data.content, 'content');
  });

  await test.step('set flags', () => {
    const message = new discord.Message();

    assert(!message.json().data.flags);

    message.setFlags(discord.MessageFlags.Ephemeral);

    assertEquals(message.json().data.flags, 1 << 6);
  });

  await test.step('set type', () => {
    const message = new discord.Message(discord.MessageType.Update);

    assertEquals(message.json().type, 7);

    message.setType(discord.MessageType.Ping);

    assertEquals(message.json().type, 1);
  });

  await test.step('send', async () => {
    const message = new discord.Message().setContent('content');

    const json = await message.send().json();

    assertEquals(json, {
      type: 4,
      data: {
        content: 'content',
        components: [],
        embeds: [],
      },
    });
  });
});

Deno.test('static messages', async (test) => {
  await test.step('pong', async () => {
    const message = discord.Message.pong();

    const json = await message.json();

    assertEquals(json, {
      type: 1,
    });
  });

  await test.step('internal error', () => {
    const message = discord.Message.internal('id');

    assertEquals(message.json(), {
      type: 4,
      data: {
        content:
          'An Internal Error occurred and was reported.\n```ref_id: id```',
        components: [],
        embeds: [],
      },
    });
  });
});

Deno.test('patch messages', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    // deno-lint-ignore no-explicit-any
    () => true as any,
  );

  try {
    const message = new discord.Message();

    await message.patch('token');

    assertSpyCalls(fetchStub, 1);

    assertSpyCall(fetchStub, 0, {
      args: [
        'https://discord.com/api/v10/webhooks/undefined/token/messages/@original',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            embeds: [],
            components: [],
          }),
        },
      ],
      // deno-lint-ignore no-explicit-any
      returned: true as any,
    });
  } finally {
    fetchStub.restore();
  }
});

Deno.test('page messages', async (test) => {
  await test.step('1/2', () => {
    const message = discord.Message.page({
      id: 'id',
      total: 2,
      embeds: [new discord.Embed().setTitle('title')],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        embeds: [{
          type: 'rich',
          title: 'title',
        }],
        components: [{
          type: 1,
          components: [{
            custom_id: '_',
            disabled: true,
            label: '1/2',
            style: 2,
            type: 2,
          }, {
            custom_id: 'id=1',
            label: 'Next',
            style: 2,
            type: 2,
          }],
        }],
      },
    });
  });

  await test.step('2/2', () => {
    const message = discord.Message.page({
      id: 'id',
      page: 1,
      total: 2,
      embeds: [new discord.Embed().setTitle('title')],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        embeds: [{
          type: 'rich',
          title: 'title',
        }],
        components: [{
          type: 1,
          components: [{
            custom_id: 'id=0',
            label: 'Prev',
            style: 2,
            type: 2,
          }, {
            custom_id: '_',
            disabled: true,
            label: '2/2',
            style: 2,
            type: 2,
          }],
        }],
      },
    });
  });

  await test.step('2/3', () => {
    const message = discord.Message.page({
      id: 'id',
      page: 1,
      total: 3,
      embeds: [new discord.Embed().setTitle('title')],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        embeds: [{
          type: 'rich',
          title: 'title',
        }],
        components: [{
          type: 1,
          components: [{
            custom_id: 'id=0',
            label: 'Prev',
            style: 2,
            type: 2,
          }, {
            custom_id: '_',
            disabled: true,
            label: '2/3',
            style: 2,
            type: 2,
          }, {
            custom_id: 'id=2',
            label: 'Next',
            style: 2,
            type: 2,
          }],
        }],
      },
    });
  });

  await test.step('1/1', () => {
    const message = discord.Message.page({
      id: 'id',
      total: 1,
      embeds: [new discord.Embed().setTitle('title')],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        embeds: [{
          type: 'rich',
          title: 'title',
        }],
        components: [{
          type: 1,
          components: [{
            custom_id: '_',
            disabled: true,
            label: '1/1',
            style: 2,
            type: 2,
          }],
        }],
      },
    });
  });
});
