import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import { Embed, Interaction, InteractionType } from '../src/discord.ts';

Deno.test('command interaction', () => {
  const body = JSON.stringify({
    id: 'body_id',
    token: 'body_token',
    type: InteractionType.Command,
    member: {
      user: {
        id: 'user_id',
      },
    },
    data: {
      name: 'Data Name',
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

  const interaction = new Interaction<string | number | boolean>(body);

  assertEquals(interaction.id, 'body_id');
  assertEquals(interaction.token, 'body_token');

  assertEquals(interaction.type, 2);

  assertEquals(interaction.name, 'data_name');

  assertEquals(interaction.member!.user.id, 'user_id');

  assertEquals(interaction.options!['text'], 'text');
  assertEquals(interaction.options!['boolean'], true);
  assertEquals(interaction.options!['number'], 420);
});

Deno.test('component interaction', () => {
  const body = JSON.stringify({
    id: 'body_id',
    token: 'body_token',
    type: InteractionType.Component,
    member: {
      user: {
        id: 'user_id',
      },
    },
    data: {
      custom_id: 'test_id:abc:123',
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

  const interaction = new Interaction<string | number | boolean>(body);

  assertEquals(interaction.id, 'body_id');
  assertEquals(interaction.token, 'body_token');

  assertEquals(interaction.type, 3);

  assertEquals(interaction.customType, 'test_id');
  assertEquals(interaction.customValues, ['abc', '123']);

  assertEquals(interaction.member!.user.id, 'user_id');

  assertEquals(interaction.options!['text'], 'text');
  assertEquals(interaction.options!['boolean'], true);
  assertEquals(interaction.options!['number'], 420);
});

Deno.test('embeds', async (test) => {
  const embed = new Embed();

  embed.setAuthor({ name: 'a', url: 'b', icon_url: 'c' });
  embed.setTitle('abc');
  embed.setDescription('abc');
  embed.setUrl('abc');

  embed.setColor('#3E5F8A');
  embed.setThumbnail({ url: 'abc' });
  embed.setImage({ url: 'abc' });

  embed.setFooter({ text: 'a', icon_url: 'b' });

  assertEquals(embed.data().type, 2);

  await test.step('author', () => {
    assertEquals(embed.data().author!.name, 'a');
    assertEquals(embed.data().author!.url, 'b');
    assertEquals(embed.data().author!.icon_url, 'c');
  });

  await test.step('title', () => {
    assertEquals(embed.data().title, 'abc');
  });

  await test.step('description', () => {
    assertEquals(embed.data().description!, 'abc');
  });

  await test.step('url', () => {
    assertEquals(embed.data().url, 'abc');
  });

  await test.step('color', () => {
    assertEquals(embed.data().color!, 4087690);
  });

  await test.step('thumbnail', () => {
    assertEquals(embed.data().thumbnail!.url, 'abc');
  });

  await test.step('image', () => {
    assertEquals(embed.data().image!.url, 'abc');
  });

  await test.step('footer', () => {
    assertEquals(embed.data().footer!.text, 'a');
    assertEquals(embed.data().footer!.icon_url, 'b');
  });
});
