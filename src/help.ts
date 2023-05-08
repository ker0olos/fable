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
          .setTitle('`/synthesize`')
          .setDescription([
            '~~Synthesize Merge~~ Sacrifice characters to pull a new character with a higher rating.',
            '',
            '__Be careful where you sacrifice your characters.__',
            'Characters are the main currency in Fable. While synthesis returns a higher-rated character its *"currency"* value will always be lower than the sum of the sacrificed characters.',
            '',
            '__Your party members and likes will never be sacrificed.__ To protect characters from synthesis, add them to your likeslist with `/like`',
            '',
            '__It takes 5 characters from a specific rating__ to get a new character with 1 more star than the sacrificed.',
            '',
            '__Fable will always auto-synthesize your lower-rated characters first.__',
            '',
            `Example: \`/synthesize 3\` will sacrifice __25 of your 1${discord.emotes.smolStar}characters__`,
            `or __5 of your 2${discord.emotes.smolStar}characters__ or any other combination of both lower ratings.`,
            '',
            '> *Sacrificed characters will return to being available in `/gacha`*',
            '\u200B',
          ].join('\n'))
          .setFooter({ text: 'aliases: /merge' }),
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
            'You will need a party to use combat features but all combat features are still in development, so parties are only an aesthetic right now.',
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
            'When all negotiation fails, it\'s fine to take what you want by force, right?',
            '',
            '__You can\'t steal characters assigned as party members__, meaning you can protect your most precious characters by adding them to your party.',
            '',
            '__Inactive users are easier to steal from.__ Stay active by using `/gacha` or `/q` once a day.',
            '',
            `__The higher the character's rating the harder it is to steal.__ 5${discord.emotes.smolStar}characters have a base success rate of 1%`,
            '',
            `__Steal has a cooldown of ${COOLDOWN_DAYS} days__ regardless of the outcome of the attempt.`,
            '',
            '> Staying active is the best defense against stealing',
            '\u200B',
          ].join('\n')),
      ),
    new discord.Message()
      .addComponents([
        new discord.Component()
          .setLabel('/vote')
          .setId('now', userId),
        new discord.Component()
          .setId('buy', 'bguaranteed', userId, '4')
          .setLabel(`/buy guaranteed 4`),
        new discord.Component()
          .setId('buy', 'bguaranteed', userId, '5')
          .setLabel(`/buy guaranteed 5`),
      ])
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Voting' })
          .setDescription([
            'Voting is an additional way to acquire character with a specific guaranteed rating.',
            '',
            '__Voting on weekends__ awards **2** votes instead of **1** (_Saturday and Sunday_).',
            '',
            `\`/buy normal\` gets you normal pulls, they are the exact same as the ones you get each ${RECHARGE_MINS} minutes.`,
            '',
            '`/buy guaranteed` however is special, while it can expansive it will guarantee that you get a character from one specific rank. Use the guaranteed pulls you bought by calling `/pull stars:`',
            '',
            `> *Example: \`/buy guaranteed 5\` will guarantee you a random 5${discord.emotes.smolStar}character.*`,
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
          .setUrl('https://github.com/sponsors/ker0olos'),
      ])
      .addEmbed(
        new discord.Embed()
          .setAuthor({ name: 'Roadmap' })
          .setDescription([
            '__**Recently Added**__',
            '',
            '`/steal`\n_steal a character from another user_',
            '',
            '`/synthesize`\n_merge characters together to pull a new character_',
            '',
            '__**Releasing in the near future (5 days ~ 2 months)**__',
            '',
            '_> There\'s a feature freeze right now to focus on QoL changes._',
            // '**[Daily Quests](https://github.com/ker0olos/fable/issues/75)**',
            // 'Complete quests for rewards',
            // '',
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
            '- `/now` `/vote` `/daily` `/tu`: _check what you can do right now_',
            '- `/search` `/anime` `/manga`: _search for specific media_',
            '- `/character` `/char`: _search for a specific character_',
            '',
            '- `/synthesize` `/merge`: _synthesize characters together to pull a new character_',
            '',
            '- `/party view` `/team view` `/p view`: _view your current party_',
            '- `/party assign` `/team assign` `/p assign`: _assign a character to your party_',
            '- `/party swap` `/team swap` `/p swap`: _swap characters spots with each others_',
            '- `/party remove` `/team remove` `/p remove`: _remove a character from your party_',
            '',
            '- `/collection list` `/coll list` `/mm list`: _list user characters in bulks_',
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
            '- `/like`: _like a character to be notified if someone finds them_',
            '- `/unlike`: _remove character from your likes_',
            '- `/likeslist`: _list user liked characters_',
            '',
            '- `/buy normal` `/shop normal`: _use votes to buy normal pulls_',
            '- `/buy guaranteed` `/shop guaranteed`: _use votes to buy pulls with a specific guaranteed rating_',
            '',
            '- `/anilist next_episode`: _find when the next episode of an anime is airing_',
          ].join('\n')),
      ),
    new discord.Message()
      .addEmbed(
        new discord.Embed().setAuthor({ name: 'Admin Commands' })
          .setDescription([
            '_> `/packs` requires `Manage Server` permission by default, but that can be changed in the `Integrations` section of your server settings, although we don\'t recommend that._',
            '- `/packs builtin`: _list all the builtin packs_',
            '- `/packs community`: _list all installed community packs_',
            '',
            '- `/packs install`: _install a community pack_',
            '- `/packs update`: _update a community pack_',
            '- `/packs uninstall`: _uninstall a pack_',
            '',
            '- `/packs validate`: _find errors in a pack\'s "manifest.json"_',
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
