// import { gql, request } from './graphql.ts';

// import config, { faunaUrl } from './config.ts';

import packs from './packs.ts';

import search, { idPrefix } from './search.ts';

import config from './config.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

function pre({
  token,
  userId,
  guildId,
  targetId,
  give,
  take,
}: {
  token: string;
  userId: string;
  guildId: string;
  targetId: string;
  give: string[];
  take: string[];
}): discord.Message {
  Promise.all([
    // TODO optimize this to lower the number of external requests
    ...give.map((char) =>
      packs.characters(
        char.startsWith(idPrefix)
          ? { ids: [char.substring(idPrefix.length)], guildId }
          : { search: char, guildId },
      ).then((results) => results[0])
    ),
    ...take.map((char) =>
      packs.characters(
        char.startsWith(idPrefix)
          ? { ids: [char.substring(idPrefix.length)], guildId }
          : { search: char, guildId },
      ).then((results) => results[0])
    ),
  ])
    .then((results) => results.filter(Boolean))
    .then(async (results) => {
      // TODO TEST

      const message = new discord.Message();

      if (results.length !== (give.length + take.length)) {
        throw new Error('404');
      }

      const giveCharacters = results.slice(0, give.length);

      const giveNames = giveCharacters.map(({ name }) =>
        `${packs.aliasToArray(name)[0]}`
      ).join(', ');

      const takeCharacters = results.slice(give.length);

      const takeNames = takeCharacters.map(({ name }) =>
        `${packs.aliasToArray(name)[0]}`
      ).join(', ');

      message.setContent(`<@${take.length ? targetId : userId}>`);

      takeCharacters.forEach((character) => {
        message.addEmbed(
          search.characterEmbed(character, {
            footer: false,
            description: false,
            media: { title: true },
            mode: 'thumbnail',
          }).addField({ value: `${discord.emotes.remove}` }),
        );
      });

      giveCharacters.forEach((character) => {
        message.addEmbed(
          search.characterEmbed(character, {
            footer: false,
            description: false,
            media: { title: true },
            mode: 'thumbnail',
          }).addField({
            value: `${
              take.length ? discord.emotes.add : discord.emotes.remove
            }`,
          }),
        );
      });

      if (take.length) {
        message.addEmbed(
          new discord.Embed().setDescription(
            `<@${userId}> is offering that you lose **${takeNames}** ${discord.emotes.remove} and get **${giveNames}** ${discord.emotes.add}`,
          ),
        );

        message.addComponents([
          new discord.Component().setId('TODO1')
            .setLabel('Accept'),
          new discord.Component().setId('TODO2')
            .setStyle(discord.ButtonStyle.Red)
            .setLabel('Decline'),
        ]);
      } else {
        message.addEmbed(
          new discord.Embed().setDescription(
            `Are you sure you want to give **${giveNames}** ${discord.emotes.remove} to <@${targetId}> for free?`,
          ),
        );

        message.addComponents([
          new discord.Component().setId('TODO1')
            .setLabel('Confirm'),
          new discord.Component().setId('TODO2')
            .setStyle(discord.ButtonStyle.Red)
            .setLabel('Cancel'),
        ]);
      }

      await message.patch(token);
    })
    .catch(async (err) => {
      // TODO TEST
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Some of those character do not exist or are disabled',
            ),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  // TODO TEST
  const loading = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

const trade = {
  pre,
};

export default trade;
