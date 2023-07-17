import { COSTS } from '../models/add_tokens_to_user.ts';
import { RECHARGE_MINS } from '../models/get_user_inventory.ts';
import { COOLDOWN_DAYS } from '../models/steal_character.ts';

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
            `__You get a free pull every ${RECHARGE_MINS} minutes (maxed at 5 pulls)__. Use \`/now\` to check how many pulls you have and how much time is left until your next free pull.`,
            '',
            '__Characters are exclusive__, once a player on this server finds a character, no one else can find that character in gacha again.',
            '',
            `__Characters vary in ranks from 1${discord.emotes.smolStar}to 5${discord.emotes.smolStar}__ A character rating is based on their popularity (a character rating cannot be raised).`,
            '',
            `__Gacha rates depend on multiple variables__, but generally speaking the chances of a 5${discord.emotes.smolStar}appearing is equal or less than 1%.`,
            '',
            '> *`/q` allows you to do gacha pulls with no animations*',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /w, /q' }),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: '2.' })
          .setTitle('`/merge`')
          .setDescription([
            'Sacrifice characters to pull a new character with a higher rating.',
            '',
            '__Your party members and likes will never be sacrificed.__ To protect characters from being merged, add them to your likeslist with `/like`',
            '',
            '__It takes 5 characters with a lower rating__ to pull a new character',
            '',
            '__Fable will always auto-merge your lowest-rated characters first.__',
            '',
            `Example: \`/merge target: 3\` will sacrifice __25 of your 1${discord.emotes.smolStar}characters__`,
            `or __5 of your 2${discord.emotes.smolStar}characters.__`,
            '',
            '> *Sacrificed characters will return to being available in `/gacha`*',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /synthesis' }),
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
          .setAuthor({ name: '3.' })
          .setTitle('`/party`')
          .setDescription([
            'You will need a party to use combat features',
            '',
            '__You can\'t have more than 1 party__ or save your current party to a preset and switch between presets.',
            '',
            '__The more your party members are familiar with each other the better they preform__. This is called synergy, five party members from the same anime are better than 5 members from a mix of different media.',
            '',
            '`/party view` to see your current party.',
            '',
            '`/party assign name: spot:` to assign a character you have to your party;',
            'leaving the `spot:` empty will assign the character to the first empty spot or override the last spot.',
            '',
            '> *`/collection` can be used to browse your characters and select your potential party members*',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /team, /p' }),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Stealing' })
          .setDescription([
            'When all negotiations fails, it\'s fine to take what you want by force, right?',
            '',
            '__You can\'t steal characters assigned as party members__, meaning you can protect your most precious characters by adding them to your party.',
            '',
            '__Inactive users are easier to steal from.__ Stay active by using `/gacha` or `/q` once a day.',
            '',
            '__Inactive users lose their party protection__ after **4** days.',
            '',
            `__The higher the character's rating the harder it is to steal.__ 5${discord.emotes.smolStar}characters have a base success rate of 1%.`,
            '',
            `__Steal has a cooldown of **${COOLDOWN_DAYS}** days__ regardless of the outcome of the attempt.`,
            '',
            '__You can sacrifice your own characters for a small boost__ to your chance of success, You lose those characters regardless of the outcome of the attempt.',
            '',
            '> Staying active is the best defense against stealing.',
            '\u200B',
          ].join('\n')),
      ),
    new discord.Message()
      .addComponents([
        new discord.Component()
          .setLabel('/vote')
          .setId('now', userId),
        new discord.Component()
          .setId('buy', 'bguaranteed', userId, '5')
          .setLabel(`/buy guaranteed 5`),
      ])
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Shop' })
          .setDescription([
            'The shop is a way to purchase extra pulls and guaranteed pulls.',
            '',
            '__You get 1 Daily Token every day__, automatically added after your first `/gacha` of the day.',
            '',
            '__Voting for Fable on Top.gg awards 1 daily token__, you can vote once every 12 hours.',
            '',
            '__Voting on weekends awards 2 tokens__ (_Fridays, Saturdays and Sundays_).',
            '',
            `\`/buy normal\` gets you extra pulls, they are the exact same as the ones you get every ${RECHARGE_MINS} minutes.`,
            '',
            '`/buy guaranteed` guarantees you get a character from one specific star rating.',
            '',
            `Example: \`/buy guaranteed 5\` will guarantee you get one random 5${discord.emotes.smolStar}character.`,
            '',
            `3${discord.emotes.smolStar}cost **${COSTS.THREE}** tokens`,
            `4${discord.emotes.smolStar}cost **${COSTS.FOUR}** tokens`,
            `5${discord.emotes.smolStar}cost **${COSTS.FIVE}** tokens`,
            '',
            'Use the guaranteed pulls you bought by calling `/pull stars:`',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /shop' }),
      ),
    new discord.Message()
      .addComponents([
        new discord.Component()
          .setLabel('Full Roadmap')
          .setUrl('https://github.com/ker0olos/fable/issues/1'),
        new discord.Component()
          .setLabel('GitHub')
          .setUrl('https://github.com/ker0olos/fable'),
        new discord.Component()
          .setLabel('Discord Support Server')
          .setUrl('https://discord.gg/H69RVBxeYY'),
        new discord.Component()
          .setLabel('Donate')
          .setUrl('https://ko-fi.com/ker0olos'),
      ])
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Roadmap' })
          .setDescription([
            '__**Releasing in the near future (5 days ~ 2 months)**__',
            '',
            '**[Battles](https://github.com/ker0olos/fable/issues/74)**',
            '',
            '**[Leveling Up Characters](https://github.com/ker0olos/fable/issues/64)**',
            '',
            '**[Player vs. Environment](https://github.com/ker0olos/fable/issues/58)**',
            '',
          ].join('\n')),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Essential Commands' })
          .setDescription([
            '- `/gacha` `/w`: _start a new gacha pull_',
            '- `/q`: _start a gacha pull but with no animations_',
            '- `/pull` `/guaranteed`: _use the guaranteed pulls you have_',
            '',
            '- `/now` `/vote` `/tu`: _check what you can do right now_',
            '- `/search` `/anime` `/manga`: _search for specific media_',
            '- `/character` `/char`: _search for a specific character_',
            '',
            '- `/merge` `/synthesize`: _merge characters together to pull a new character_',
            '',
            '- `/party view` `/team view` `/p view`: _view your current party_',
            '- `/party assign` `/team assign` `/p assign`: _assign a character to your party_',
            '- `/party swap` `/team swap` `/p swap`: _swap characters spots with each others_',
            '- `/party remove` `/team remove` `/p remove`: _remove a character from your party_',
            '',
            '- `/collection stars` `/coll stars` `/mm stars`: _view user your stars_',
            '- `/collection media` `/coll media` `/mm media`: _view user characters in a specific media_',
            '',
            '- `/steal`: _steal a character from another user_',
            '- `/trade` `/offer`: _trade characters with another user_',
            '- `/give` `/gift`: _give characters to another user_',
          ].join('\n')),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Other Commands' })
          .setDescription([
            '- `/nick`: _change the nickname of a character_',
            '- `/image` `/custom`: _change the image of a character_',
            '',
            '- `/found` `/owned`: _list all characters found from a specific media_',
            '',
            '- `/likeslist`: _list user likes_',
            '',
            '- `/like` `/protect` `/wish`: _like a character to be notified if someone finds them_',
            '- `/unlike`: _remove character from your likes_',
            '- `/likeall`: _like a media to be notified if someone finds any character from it_',
            '- `/unlikeall`: _remove media from your likes_',
            '',
            '- `/buy normal` `/shop normal`: _use votes to buy normal pulls_',
            '- `/buy guaranteed` `/shop guaranteed`: _use votes to buy pulls with a specific guaranteed rating_',
            '',
            '- `/packs`: _list all the packs on a server_',
            '',
            '- `/logs`: _list user last few found characters_',
          ].join('\n')),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed().setAuthor({ name: 'Admin Commands' })
          .setDescription([
            '_> `/community` requires `Manage Server` permission by default, but that can be changed in the `Integrations` section of your server settings, although we never recommend that._',
            '- `/community popular`: _browse the most popular community packs_',
            '- `/community install`: _install a community pack_',
            '- `/community uninstall`: _uninstall a community pack_',
            '',
            '> To create your own community pack visit <https://packs.deno.dev>',
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
