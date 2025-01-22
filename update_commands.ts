// deno-lint-ignore-file camelcase

import { green } from '$std/fmt/colors.ts';

import { AvailableLocales } from '~/src/discord.ts';

import { skillCategories } from '~/src/types.ts';

import EN from '~/i18n/en-US.json' with { type: 'json' };
import ES from '~/i18n/es-ES.json' with { type: 'json' };
import BR from '~/i18n/pt-BR.json' with { type: 'json' };

enum CommandType {
  'CHAT' = 1,
  'USER' = 2,
}

const spots = [
  { name: '1', value: 1 },
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
];

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

type LocalizationString = Partial<Record<AvailableLocales, string>>;

type Command = {
  type?: CommandType;
  name: string;
  description?: string;
  options?: ReturnType<typeof Option>[];
  aliases?: string[];
  defaultPermission?: Permission;
};

type Option = {
  type: Type;
  name: string;
  description: string;
  autocomplete?: boolean;
  options?: Option[];
  choices?: Choice[];
  optional?: boolean;
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
};

type Choice = {
  name: string;
  name_localizations?: LocalizationString;
  value: string | number;
};

const Option = (option: Option): Option => option;

const Command = ({
  name,
  description,
  type,
  options,
  aliases,
  defaultPermission,
}: Command) => {
  // deno-lint-ignore no-explicit-any
  const transformOption: any = (option: Option) => ({
    name: option.name,
    description: option.description && option.description in EN
      ? EN[option.description as keyof typeof EN]
      : option.description,
    autocomplete: option.autocomplete,
    type: option.type.valueOf(),
    choices: option.choices,
    required: !option.optional,
    min_value: option.min_value,
    max_value: option.max_value,
    min_length: option.min_length,
    max_length: option.max_length,
    description_localizations: {
      'es-ES': option.description && option.description in ES
        ? ES[option.description as keyof typeof ES]
        : undefined,
      'pt-BR': option.description && option.description in BR
        ? BR[option.description as keyof typeof BR]
        : undefined,
    },
    options: option.options?.map((option) => transformOption(option)),
  });

  const commands = [{
    name,
    type,
    description: description && description in EN
      ? EN[description as keyof typeof EN]
      : description,
    default_member_permissions: defaultPermission,
    description_localizations: {
      'es-ES': description && description in ES
        ? ES[description as keyof typeof ES]
        : undefined,
    },
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
    description: '/search',
    options: [
      Option({
        name: 'title',
        description: '$media-title',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'debug',
        description: '$debug',
        type: Type.BOOLEAN,
        optional: true,
      }),
      Option({
        name: 'characters',
        description: '$media-characters',
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'character',
    description: '/character',
    options: [
      Option({
        name: 'name',
        description: '$character-name',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'debug',
        description: '$debug',
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'found',
    aliases: ['owned'],
    description: '/found',
    options: [
      Option({
        name: 'title',
        description: '$media-title',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'like',
    description: '/like',
    aliases: ['protect', 'wish'],
    options: [
      Option({
        name: 'name',
        description: '$character-name',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'unlike',
    description: '/unlike',
    options: [
      Option({
        name: 'name',
        description: '$character-name',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'likeall',
    description: '/likeall',
    options: [
      Option({
        name: 'title',
        description: '$media-title',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'unlikeall',
    description: '/unlikeall',
    options: [
      Option({
        name: 'title',
        description: '$media-title',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'likeslist',
    description: '/likeslist',
    options: [
      Option({
        name: 'user',
        description: '$user-likes-list',
        type: Type.USER,
        optional: true,
      }),
      Option({
        name: 'filter-owned',
        description: '$user-likes-filter-owned',
        type: Type.BOOLEAN,
        optional: true,
      }),
      Option({
        name: 'owned-by',
        description: '$user-likes-owned-by',
        type: Type.USER,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'give',
    description: '/give',
    aliases: ['gift'],
    options: [
      Option({
        name: 'user',
        description: '$trade-user',
        type: Type.USER,
      }),
      Option({
        name: 'give',
        description: '$trade-give-character',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'give2',
        description: '$trade-give-character',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'give3',
        description: '$trade-give-character',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'trade',
    description: '/trade',
    aliases: ['offer'],
    options: [
      Option({
        name: 'user',
        description: '$trade-user',
        type: Type.USER,
      }),
      Option({
        name: 'give',
        description: '$trade-give-character',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'take',
        description: '$trade-take-character',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'give2',
        description: '$trade-give-character',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'give3',
        description: '$trade-give-character',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'take2',
        description: '$trade-take-character',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'take3',
        description: '$trade-take-character',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'steal',
    description: '/steal',
    options: [
      Option({
        name: 'name',
        description: '$character-name',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'help',
    description: '/help',
    aliases: ['start', 'guide', 'wiki', 'tuto'],
    options: [
      Option({
        name: 'page',
        description: '$help-page',
        optional: true,
        type: Type.INTEGER,
        choices: [
          {
            name: EN['$help-page-gacha'],
            name_localizations: {
              'es-ES': ES['$help-page-gacha'],
              'pt-BR': BR['$help-page-gacha'],
            },
            value: 0,
          },
          {
            name: EN['$help-page-merging'],
            name_localizations: {
              'es-ES': ES['$help-page-merging'],
              'pt-BR': BR['$help-page-merging'],
            },
            value: 1,
          },
          {
            name: EN['$help-page-party'],
            name_localizations: {
              'es-ES': ES['$help-page-party'],
              'pt-BR': BR['$help-page-party'],
            },
            value: 2,
          },
          {
            name: EN['$help-page-stealing'],
            name_localizations: {
              'es-ES': ES['$help-page-stealing'],
              'pt-BR': BR['$help-page-stealing'],
            },
            value: 3,
          },
          {
            name: EN['$help-page-combat'],
            name_localizations: {
              // 'es-ES': ES['$help-page-combat'],
            },
            value: 4,
          },
          {
            name: EN['$help-page-shop'],
            name_localizations: {
              'es-ES': ES['$help-page-shop'],
              'pt-BR': BR['$help-page-shop'],
            },
            value: 5,
          },
          {
            name: EN['$help-page-essential-commands'],
            name_localizations: {
              'es-ES': ES['$help-page-essential-commands'],
              'pt-BR': BR['$help-page-essential-commands'],
            },
            value: 6,
          },
          {
            name: EN['$help-page-other-commands'],
            name_localizations: {
              'es-ES': ES['$help-page-other-commands'],
              'pt-BR': BR['$help-page-other-commands'],
            },
            value: 7,
          },
          {
            name: EN['$help-page-admin-commands'],
            name_localizations: {
              'es-ES': ES['$help-page-admin-commands'],
              'pt-BR': BR['$help-page-admin-commands'],
            },
            value: 8,
          },
        ],
      }),
    ],
  }),
  ...Command({
    name: 'now',
    description: '/now',
    aliases: ['tu'],
  }),
  ...Command({
    name: 'q',
    description: '/q',
  }),
  ...Command({
    name: 'gacha',
    description: '/gacha',
    aliases: ['w'],
  }),
  ...Command({
    name: 'pull',
    description: '/pull',
    aliases: ['guaranteed'],
    options: [
      Option({
        name: 'stars',
        description: '$stars',
        type: Type.INTEGER,
        choices: spots.slice(2).toReversed(),
      }),
    ],
  }),
  ...Command({
    name: 'image',
    description: '/image',
    aliases: ['custom'],
    options: [
      Option({
        name: 'character',
        description: '$character-name',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'new_image',
        description: '$new-image',
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'nick',
    description: '/nick',
    options: [
      Option({
        name: 'character',
        description: '$character-name',
        type: Type.STRING,
        autocomplete: true,
      }),
      Option({
        name: 'new_nick',
        description: '$new-nick',
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'merge',
    description: '/merge',
    aliases: ['synthesize'],
    options: [
      Option({
        name: 'target',
        description: '$merge-star-target',
        choices: spots.slice(1).toReversed(),
        type: Type.INTEGER,
      }),
      // Option({
      //   name: 'min',
      //   description: '/merge min',
      //   type: Type.SUB_COMMAND,
      //   optional: true,
      // }),
      // Option({
      //   name: 'max',
      //   description: '/merge max',
      //   type: Type.SUB_COMMAND,
      //   optional: true,
      // }),
    ],
  }),
  ...Command({
    name: 'automerge',
    description: '/automerge',
    options: [
      Option({
        name: 'min',
        description: '/automerge min',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'max',
        description: '/automerge max',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'logs',
    description: '/logs',
    aliases: ['history'],
    options: [
      Option({
        name: 'user',
        description: '$user-list',
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
        description: '/buy normal',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            min_value: 1,
            max_value: 99,
            name: 'amount',
            description: '$buy-normal-amount',
            type: Type.INTEGER,
          }),
        ],
      }),
      Option({
        name: 'guaranteed',
        description: '/buy guaranteed',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'stars',
            description: '$buy-guaranteed-stars',
            type: Type.INTEGER,
            choices: spots.slice(2).toReversed(),
          }),
        ],
      }),
      Option({
        name: 'keys',
        description: '/buy keys',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            min_value: 1,
            max_value: 99,
            name: 'amount',
            description: '$buy-keys-amount',
            type: Type.INTEGER,
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
        name: 'clear',
        description: '/party clear',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'view',
        description: '/party view',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'user',
            description: '$user-party',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'assign',
        description: '/party assign',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'name',
            description: '$character-name',
            autocomplete: true,
            type: Type.STRING,
          }),
          Option({
            name: 'spot',
            description: '$party-spot',
            type: Type.INTEGER,
            optional: true,
            choices: spots,
          }),
        ],
      }),
      Option({
        name: 'swap',
        description: '/party swap',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'a',
            description: '$party-swap-1',
            type: Type.INTEGER,
            choices: spots,
          }),
          Option({
            name: 'b',
            description: '$party-swap-2',
            type: Type.INTEGER,
            choices: spots,
          }),
        ],
      }),
      Option({
        name: 'remove',
        description: '/party remove',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'spot',
            description: '$party-remove-spot',
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
        name: 'show',
        description: '/coll show',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'user',
            description: '$user-list',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'stars',
        description: '/coll stars',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'rating',
            description: '$stars',
            type: Type.INTEGER,
            choices: spots.toReversed(),
          }),
          Option({
            name: 'user',
            description: '$user-list',
            type: Type.USER,
            optional: true,
          }),
          Option({
            name: 'picture',
            description: '$picture',
            type: Type.BOOLEAN,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'media',
        description: '/coll media',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'title',
            description: '$media-title',
            type: Type.STRING,
            autocomplete: true,
          }),
          Option({
            name: 'user',
            description: '$user-list',
            type: Type.USER,
            optional: true,
          }),
          Option({
            name: 'picture',
            description: '$picture',
            type: Type.BOOLEAN,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'sum',
        description: '/coll sum',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'user',
            description: '$user-list',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
    ],
  }),
  // pack viewing
  ...Command({
    name: 'installed',
    description: 'community packs management commands',
    options: [
      Option({
        name: 'packs',
        description: '/installed packs',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
    ],
  }),
  // community packs management commands
  ...Command({
    name: 'packs',
    description: 'community packs management commands',
    defaultPermission: Permission.MANAGE_GUILD,
    options: [
      Option({
        name: 'installed',
        description: '/installed packs',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'install',
        description: '/packs install',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'id',
            description: '$pack-id',
            type: Type.STRING,
          }),
        ],
      }),
      Option({
        name: 'uninstall',
        description: '/packs uninstall',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'id',
            description: '$pack-id',
            autocomplete: true,
            type: Type.STRING,
          }),
        ],
      }),
    ],
  }),
  // server management commands
  ...Command({
    name: 'server',
    description: 'server management commands',
    defaultPermission: Permission.MANAGE_GUILD,
    options: [
      Option({
        name: 'options',
        description: '/server options',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
    ],
  }),
  // admin rewards system
  ...Command({
    name: 'reward',
    description: 'reward commands',
    defaultPermission: Permission.MANAGE_GUILD,
    options: [
      Option({
        name: 'pulls',
        description: '/reward pulls',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'user',
            description: '$user-reward',
            type: Type.USER,
          }),
          Option({
            min_value: 1,
            max_value: 99,
            name: 'amount',
            description: '$reward-pulls',
            type: Type.INTEGER,
          }),
        ],
      }),
    ],
  }),
  //
  ...Command({
    name: 'stats',
    description: '/stats',
    options: [
      Option({
        name: 'name',
        description: '$character-name',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'skills',
    description: 'characters skill management',
    options: [
      Option({
        name: 'showall',
        description: '/skills showall',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'category',
            description: '$skill-categories',
            optional: true,
            type: Type.STRING,
            choices: skillCategories.map((category) => ({
              value: category,
              name: EN[category],
              name_localizations: {
                // deno-lint-ignore no-explicit-any
                'es-ES': (ES as any as typeof EN)[category],
                // deno-lint-ignore no-explicit-any
                'pt-BR': (BR as any as typeof EN)[category],
              },
            })),
          }),
        ],
      }),
      Option({
        name: 'acquire',
        description: '/skills acquire',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'character',
            description: '$character-name',
            autocomplete: true,
            type: Type.STRING,
          }),
          Option({
            name: 'skill',
            autocomplete: true,
            description: '$skill-name',
            type: Type.STRING,
          }),
        ],
      }),
      Option({
        name: 'upgrade',
        description: '/skills upgrade',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'character',
            description: '$character-name',
            autocomplete: true,
            type: Type.STRING,
          }),
          Option({
            name: 'skill',
            autocomplete: true,
            description: '$skill-name',
            type: Type.STRING,
          }),
        ],
      }),
    ],
  }),
  ...Command({
    name: 'battle',
    description: 'battle/combat commands',
    aliases: ['bt'],
    options: [
      Option({
        name: 'tower',
        description: '/battle tower',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'challenge',
        description: '/battle challenge',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'reclear',
    description: '/reclear',
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

  await put(commands, { APP_ID, BOT_TOKEN, GUILD_ID });
}
