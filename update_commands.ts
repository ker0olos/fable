// deno-lint-ignore-file camelcase

import { load as Dotenv } from '$std/dotenv/mod.ts';

import { green } from '$std/fmt/colors.ts';

import { AvailableLocales } from './src/discord.ts';

import EN from './i18n/en-US.json' assert { type: 'json' };

await Dotenv({
  export: true,
  defaultsPath: '.env.example',
  allowEmptyValues: true,
  examplePath: null,
});

enum CommandType {
  'CHAT' = 1,
  'USER' = 2,
}

const spots = [{
  name: '1',
  value: 1,
}, {
  name: '2',
  value: 2,
}, {
  name: '3',
  value: 3,
}, {
  name: '4',
  value: 4,
}, {
  name: '5',
  value: 5,
}];

enum Type {
  'SUB_COMMAND' = 1,
  'SUB_COMMAND_GROUP' = 2,
  'STRING' = 3,
  'INTEGER' = 4,
  'BOOLEAN' = 5,
  'USER' = 6,
  'CHANNEL' = 7, // Includes all channel types + categories
  'ROLE' = 8,
  'MENTIONABLE' = 9, // Includes users and roles
  'NUMBER' = 10, // Any double between -2^53 and 2^53
  'ATTACHMENT' = 11, // attachment object
}

enum Permission {
  'OWNER' = 0,
  'ADMINISTRATORS' = 1 << 3,
  'MANAGE_GUILD' = 1 << 5,
}

type LocalizationString = Record<AvailableLocales, string>;

type Command = {
  type?: CommandType;
  name: string;
  description?: string;
  // nameLocalizations?: LocalizationString;
  descriptionLocalizations?: LocalizationString;
  options?: ReturnType<typeof Option>[];
  aliases?: string[];
  defaultPermission?: Permission;
};

type Option = {
  type: Type;
  name: string;
  description: string;
  nameLocalizations?: LocalizationString;
  descriptionLocalizations?: LocalizationString;
  autocomplete?: boolean;
  options?: Option[];
  choices?: Choice[];
  optional?: boolean;
  min_value?: number;
  max_value?: number;
};

type Choice = {
  name: string;
  value: string | number;
};

const Option = (option: Option): Option => option;

const Command = ({
  name,
  description,
  descriptionLocalizations,
  type,
  options,
  aliases,
  defaultPermission,
}: Command) => {
  // deno-lint-ignore no-explicit-any
  const transformOption: any = (option: Option) => ({
    name: option.name,
    description: option.description,
    autocomplete: option.autocomplete,
    type: option.type.valueOf(),
    choices: option.choices,
    required: !option.optional,
    min_value: option.min_value,
    max_value: option.max_value,
    name_localizations: option.nameLocalizations,
    description_localizations: option.descriptionLocalizations,
    options: option.options?.map((option) => transformOption(option)),
  });

  const commands = [{
    name,
    type,
    description,
    dm_permission: false,
    default_member_permissions: defaultPermission,
    description_localizations: descriptionLocalizations,
    options: options?.map((option) => transformOption(option)),
  }];

  aliases?.forEach((alias) =>
    commands.push({
      ...commands[0],
      name: alias,
    })
  );

  return commands;
};

async function put(commands: Command[], {
  BOT_TOKEN,
  GUILD_ID,
  APP_ID,
}: {
  APP_ID: string;
  BOT_TOKEN: string;
  GUILD_ID?: string;
}): Promise<void> {
  if (commands.length > 100) {
    throw new Error('the maximum number of commands allowed is 100');
  }

  if (!GUILD_ID) {
    console.log(
      `Updating ${commands.length} global commands for production bot\n\n`,
    );
  } else {
    console.log(`Updating ${commands.length} guild commands for dev bot\n\n`);
  }

  const url = GUILD_ID
    ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
    : `https://discord.com/api/v10/applications/${APP_ID}/commands`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (response.status !== 200) {
    throw new Error(JSON.stringify(await response.json(), undefined, 2));
  } else {
    console.log(green('OK'));
  }
}

export const commands = [
  // standard gacha commands
  // uses characters and media from all packs
  ...Command({
    name: 'search',
    aliases: ['anime', 'manga', 'media', 'series'],
    description: EN['/search'],
    options: [
      Option({
        name: 'title',
        description: EN['$media-title'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'debug',
        description: EN['$debug'],
        type: Type.BOOLEAN,
        optional: true,
      }),
      Option({
        name: 'characters',
        description: EN['$media-characters'],
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'character',
    description: EN['/character'],
    aliases: ['char'],
    options: [
      Option({
        name: 'name',
        description: EN['$character-name'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'debug',
        description: EN['$debug'],
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'found',
    aliases: ['owned'],
    description: EN['/found'],
    options: [
      Option({
        name: 'title',
        description: EN['$media-title'],
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'like',
    description: EN['/like'],
    aliases: ['protect', 'wish'],
    options: [
      Option({
        name: 'name',
        description: EN['$character-name'],
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'unlike',
    description: EN['/unlike'],
    options: [
      Option({
        name: 'name',
        description: EN['$character-name'],
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'likeall',
    description: EN['/likeall'],
    options: [
      Option({
        name: 'title',
        description: EN['$media-title'],
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'unlikeall',
    description: EN['/unlikeall'],
    options: [
      Option({
        name: 'title',
        description: EN['$media-title'],
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'likeslist',
    description: EN['/likeslist'],
    options: [
      Option({
        name: 'user',
        description: EN['$user-likes-list'],
        type: Type.USER,
        optional: true,
      }),
      Option({
        name: 'filter',
        description: EN['$user-likes-filter'],
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'give',
    description: EN['/give'],
    aliases: ['gift'],
    options: [
      Option({
        name: 'user',
        description: EN['$trade-user'],
        type: Type.USER,
      }),
      Option({
        name: 'give',
        description: EN['$trade-give-character'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'give2',
        description: EN['$trade-give-character'],
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'give3',
        description: EN['$trade-give-character'],
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'trade',
    description: EN['/trade'],
    aliases: ['offer'],
    options: [
      Option({
        name: 'user',
        description: EN['$trade-user'],
        type: Type.USER,
      }),
      Option({
        name: 'give',
        description: EN['$trade-give-character'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'take',
        description: EN['$trade-take-character'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'give2',
        description: EN['$trade-give-character'],
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'give3',
        description: EN['$trade-give-character'],
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'take2',
        description: EN['$trade-take-character'],
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'take3',
        description: EN['$trade-take-character'],
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'steal',
    description: EN['/steal'],
    options: [
      Option({
        name: 'name',
        description: EN['$character-name'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'sacrifices',
        description: EN['$steal-sacrifices-boost'],
        type: Type.INTEGER,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'help',
    description: EN['/help'],
    aliases: ['start', 'guide', 'wiki', 'tuto'],
    options: [
      Option({
        name: 'page',
        description: EN['$help-page'],
        optional: true,
        type: Type.INTEGER,
        choices: [
          {
            name: EN['$help-page-gacha'],
            value: 0,
          },
          {
            name: EN['$help-page-merging'],
            value: 1,
          },
          {
            name: EN['$help-page-party'],
            value: 2,
          },
          {
            name: EN['$help-page-stealing'],
            value: 3,
          },
          {
            name: EN['$help-page-shop'],
            value: 4,
          },
          {
            name: EN['$help-page-roadmap'],
            value: 5,
          },
          {
            name: EN['$help-page-essential-commands'],
            value: 6,
          },
          {
            name: EN['$help-page-other-commands'],
            value: 7,
          },
          {
            name: EN['$help-page-admin-commands'],
            value: 8,
          },
        ],
      }),
    ],
  }),
  ...Command({
    name: 'now',
    description: EN['/now'],
    aliases: ['vote', 'tu'],
  }),
  ...Command({
    name: 'q',
    description: EN['/q'],
  }),
  ...Command({
    name: 'gacha',
    description: EN['/gacha'],
    aliases: ['w'],
  }),
  ...Command({
    name: 'pull',
    description: EN['/pull'],
    aliases: ['guaranteed'],
    options: [
      Option({
        name: 'stars',
        description: EN['$stars'],
        type: Type.INTEGER,
        choices: spots.slice(2).toReversed(),
      }),
    ],
  }),
  ...Command({
    name: 'image',
    description: EN['/image'],
    aliases: ['custom'],
    options: [
      Option({
        name: 'character',
        description: EN['$character-name'],
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'new_image',
        description: EN['$new-image'],
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'nick',
    description: EN['/nick'],
    options: [
      Option({
        name: 'character',
        description: EN['$character-name'],
        type: Type.STRING,
        autocomplete: true,
      }),
      Option({
        name: 'new_nick',
        description: EN['$new-nick'],
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'merge',
    description: EN['/merge'],
    aliases: ['synthesize'],
    options: [
      Option({
        name: 'target',
        description: EN['$merge-star-target'],
        choices: spots.slice(1).toReversed(),
        type: Type.INTEGER,
      }),
    ],
  }),
  ...Command({
    name: 'logs',
    description: EN['/logs'],
    options: [
      Option({
        name: 'user',
        description: EN['$user-list'],
        type: Type.USER,
        optional: true,
      }),
    ],
  }),
  // shop
  ...Command({
    name: 'buy',
    description: 'token shop commands',
    aliases: ['shop'],
    options: [
      Option({
        name: 'normal',
        description: EN['/buy normal'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            min_value: 1,
            max_value: 99,
            name: 'amount',
            description: EN['$buy-normal-amount'],
            type: Type.INTEGER,
          }),
        ],
      }),
      Option({
        name: 'guaranteed',
        description: EN['/buy guaranteed'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'stars',
            description: EN['$buy-guaranteed-stars'],
            type: Type.INTEGER,
            choices: spots.slice(2).toReversed(),
          }),
        ],
      }),
    ],
  }),
  // party management
  ...Command({
    name: 'Party',
    type: CommandType.USER,
  }),
  ...Command({
    name: 'party',
    description: 'party management commands',
    aliases: ['team', 'p'],
    options: [
      Option({
        name: 'view',
        description: EN['/party view'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'user',
            description: EN['$user-party'],
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'assign',
        description: EN['/party assign'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'name',
            description: EN['$character-name'],
            autocomplete: true,
            type: Type.STRING,
          }),
          Option({
            name: 'spot',
            description: EN['$party-spot'],
            type: Type.INTEGER,
            optional: true,
            choices: spots,
          }),
        ],
      }),
      Option({
        name: 'swap',
        description: EN['/party swap'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'a',
            description: EN['$party-swap-1'],
            type: Type.INTEGER,
            choices: spots,
          }),
          Option({
            name: 'b',
            description: EN['$party-swap-2'],
            type: Type.INTEGER,
            choices: spots,
          }),
        ],
      }),
      Option({
        name: 'remove',
        description: EN['/party remove'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'spot',
            description: EN['$party-remove-spot'],
            type: Type.INTEGER,
            choices: spots,
          }),
        ],
      }),
    ],
  }),
  // collection browsing
  ...Command({
    name: 'collection',
    description: 'collection browsing commands',
    aliases: ['coll', 'mm'],
    options: [
      Option({
        name: 'stars',
        description: EN['/coll stars'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'rating',
            description: EN['$stars'],
            type: Type.INTEGER,
            choices: spots.toReversed(),
          }),
          Option({
            name: 'user',
            description: EN['$user-list'],
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'media',
        description: EN['/coll media'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'title',
            description: EN['$media-title'],
            type: Type.STRING,
            autocomplete: true,
          }),
          Option({
            name: 'user',
            description: EN['$user-list'],
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
    ],
  }),
  // pack viewing
  ...Command({
    name: 'packs',
    description: EN['/packs'],
  }),
  // community packs management commands
  ...Command({
    name: 'community',
    description: 'community packs management commands',
    defaultPermission: Permission.MANAGE_GUILD,
    options: [
      Option({
        name: 'popular',
        description: EN['/community popular'],
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'install',
        description: EN['/community install'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'id',
            description: EN['$pack-id'],
            type: Type.STRING,
          }),
        ],
      }),
      Option({
        name: 'uninstall',
        description: EN['/community uninstall'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'id',
            description: EN['$pack-id'],
            autocomplete: true,
            type: Type.STRING,
          }),
        ],
      }),
    ],
  }),
  // experimental ephemeral temporary
  ...Command({
    name: 'experimental',
    description: 'experimental ephemeral temporary commands',
    options: [
      Option({
        name: 'battle',
        description: EN['/experimental battle'],
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'versus',
            description: EN['$versus'],
            type: Type.USER,
          }),
        ],
      }),
    ],
  }),
];

if (import.meta.main) {
  const APP_ID = Deno.env.get('APP_ID');

  const BOT_TOKEN = Deno.env.get('BOT_TOKEN');

  const GUILD_ID = Deno.env.get('GUILD_ID');

  if (!APP_ID) {
    throw new Error('APP_ID is not defined');
  }

  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined');
  }

  await put(commands, {
    APP_ID,
    BOT_TOKEN,
    GUILD_ID,
  });
}
