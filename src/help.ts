// import utils from './utils.ts';

import * as discord from './discord.ts';

export function help(userId: string): discord.Message {
  const message = new discord.Message()
    .addComponents([
      // `/gacha` shortcut
      new discord.Component()
        .setId('now', userId)
        .setLabel('/now'),
    ])
    .addComponents([
      // `/gacha` shortcut
      new discord.Component()
        .setId('gacha', userId)
        .setLabel('/gacha'),
    ]);

  message.addEmbed(
    new discord.Embed().setDescription(
      `- **\`/now\`**, **\`/tu\`**:   _check what you can do right now_
- **\`/gacha\`**, **\`/w\`**:   _start a new gacha pull_
- **\`/search\`**, **\`/anime\`**, **\`/manga\`**:   _search for specific series_
- **\`/character\`**: _search for a specific character_`,
    ),
  );

  return message;
}
