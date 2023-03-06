import * as discord from './discord.ts';

function pages(
  { userId, index }: { userId: string; index: number },
): discord.Message {
  const pages = [
    new discord.Message()
      .addComponents([
        new discord.Component()
          .setId('gacha', userId)
          .setLabel('/gacha'),
        new discord.Component()
          .setId('now', userId)
          .setLabel('/now'),
      ])
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: '1.' })
          .setTitle('`/gacha`')
          .setDescription([
            'Before anything: You will need characters.',
            '',
            '__You get a free pull every 15 minutes (maxed at 5 pulls)__. Use `/now` to check how many pulls you have and how much time is left until your pulls recharge.',
            '',
            '__Characters are exclusive__, once a player on the server finds a character, no one else can find that character in gacha again. You will need trade to get them.',
            '',
            '__Characters vary in ranks from 1* to 5*__, A character rating is based on their popularity (as of right now, a character rating cannot be raised).',
            '',
            '__Gacha rates depend on multiple variables__, but generally speaking the chances of a 5* appearing is equal or less than 1%.',
            '',
            '`/pull` allows you to do gacha pulls with no animations.',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /w, /q' }),
      ),
    new discord.Message()
      .addComponents([
        new discord.Component()
          .setId('cstars', '5', userId)
          .setLabel('/collection stars 5'),
        new discord.Component()
          .setId('cstars', '4', userId)
          .setLabel('/collection stars 4'),
      ])
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: '2.' })
          .setTitle('`/party`')
          .setDescription([
            'You will need a party to use combat features, but all combat features are still in development, so parties are only an aesthetic right now.',
            '',
            '__You can\'t have more than 1 party__ or save your current party to a preset and switch between presets.',
            '',
            '__The more your party members are familiar with each other the better they preform__. This is called synergy, 5 party members from the same anime are better than 5 members from a mix of different series.',
            '',
            '`/party view` to view your current party.',
            '',
            '`/party assign [name] [spot?]` to assign a character you found to your party;',
            'leaving the `[spot]` parameter empty will assign the character to the first empty spot, or override spot #5 if no empty spots exist.',
            '',
            '`/party remove [spot]` to remove a character from your party.',
            '',
            '`/collection stars` and `/collection media` to browse your characters and select your potential party members.',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /team, /p' }),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'All Commands' })
          .setDescription([
            '- `/gacha` `/w`: _start a new gacha pull_',
            '- `/pull` `/q`: _start a quiet gacha pull with no animation_',
            '- `/now` `/checklist` `/cl` `/tu`: _check what you can do right now_',
            '- `/search` `/anime` `/manga`: _search for specific media_',
            '- `/character` `/char` `/im`: _search for a specific character_',
            '',
            '- `/party view` `/team view` `/p view`: _view your current party_',
            '- `/party assign` `/team assign` `/p assign`: _assign a character to your party_',
            '- `/party remove` `/team remove` `/p remove`: _remove a character from your party_',
            '',
            '- `/collection stars` `/coll stars` `/mm stars`: _list all your stars_',
            '- `/collection media` `/coll media` `/mm media`: _list all your characters from a specific media_',
            '',
            '- `/anilist next_episode`: _find when the next episode of an anime is airing_',
          ].join('\n')),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed().setAuthor({ name: 'Admin Commands' })
          .setDescription([
            '- `/packs community`: _list all installed community packs_',
            '- `/packs builtin`: _list all the builtin packs_',
            '- `/packs install`: _install a community pack_',
            '- `/packs remove`: _remove an installed pack_',
          ].join('\n')),
      ),
  ];

  return discord.Message.page({
    message: pages[index],
    total: pages.length,
    type: 'help',
    next: index + 1 < pages.length,
    index,
  });
}

const help = {
  pages,
};

export default help;
