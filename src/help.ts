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
            '> _`/pull` allows you to do gacha with no animations._',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /w, /q' }),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'All Commands' })
          .setDescription([
            '- `/gacha` `/w`: _start a new gacha pull_',
            '- `/now` `/cl` `/tu`: _check what you can do right now_',
            '- `/search` `/anime` `/manga`: _search for specific media',
            '- `/character` `/char` `/im`: _search for a specific character_',
            '',
            '- `/collection stars` `/mm stars`: _list all your stars_',
            '- `/collection media` `/mm media`: _list all your characters from a specific media_',
            '',
            '- `/anilist next_episode`: _find when the next episode of an anime is airing_',
          ].join('\n')),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed().setAuthor({ name: 'Admin Commands' })
          .setDescription([
            '- `/packs community`: _list all instated community packs_',
            '- `/packs builtin`: _list all the builtin packs_',
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
