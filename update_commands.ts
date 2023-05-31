// deno-lint-ignore-file camelcase

import { load as Dotenv } from '$std/dotenv/mod.ts';

import { green } from '$std/fmt/colors.ts';

import { Manifest } from './src/types.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

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

type Option = {
  type: Type;
  name: string;
  description: string;
  autocomplete?: boolean;
  options?: Option[];
  choices?: Choice[];
  optional?: boolean;
  aliases?: (string | { name: string; desc: string })[];
  min_value?: number;
  max_value?: number;
};

type Command = {
  name: string;
  type?: CommandType;
  description?: string;
  options?: ReturnType<typeof Option>[];
  aliases?: string[];
  defaultPermission?: Permission;
};

type Choice = {
  name: string;
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
    description: option.description,
    autocomplete: option.autocomplete,
    type: option.type.valueOf(),
    choices: option.choices,
    required: !option.optional,
    min_value: option.min_value,
    max_value: option.max_value,
    options: option.options?.map((option) => transformOption(option)),
  });

  const commands = [{
    name,
    type,
    description,
    dm_permission: false,
    default_member_permissions: defaultPermission,
    options: options?.map((option) => transformOption(option)),
  }];

  options?.forEach((option, index) => {
    option.aliases?.forEach((alias) => {
      commands[0].options?.push({
        ...commands[0].options[index],
        name: typeof alias === 'object' ? alias.name : alias,
        description: typeof alias === 'object'
          ? alias.desc
          : commands[0].options[index].description,
      });
    });
  });

  aliases?.forEach((alias) =>
    commands.push({
      ...commands[0],
      name: alias,
    })
  );

  return commands;
};

const Pack = (path: string): Command => {
  const data = Deno.readTextFileSync(path + '/manifest.json');

  const manifest: Manifest = JSON.parse(data);

  if (!manifest.commands) {
    throw new Error('no commands found');
  }

  return Command({
    name: manifest.id,
    // deno-lint-ignore no-non-null-assertion
    description: manifest.description!,
    options: Object.entries(manifest.commands).map(([name, command]) => {
      return Option({
        name,
        description: command.description,
        type: Type.SUB_COMMAND,
        optional: true,
        options: command.options.map((opt) =>
          Option({
            name: opt.id,
            description: opt.description,
            type: Type[opt.type.toUpperCase() as keyof typeof Type],
            optional: !opt.required,
          })
        ),
      });
    }),
  })[0];
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
    aliases: ['anime', 'manga', 'media'],
    description: 'Search for a specific media',
    options: [
      Option({
        name: 'title',
        description: 'The title of the media',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'debug',
        description: 'Display the nerdy stuff',
        type: Type.BOOLEAN,
        optional: true,
      }),
      Option({
        name: 'characters',
        description: 'View the characters from the media',
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'character',
    description: 'Search for a specific character',
    aliases: ['char'],
    options: [
      Option({
        name: 'name',
        description: 'The name of the character',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'debug',
        description: 'Display the nerdy stuff',
        type: Type.BOOLEAN,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'found',
    aliases: ['owned'],
    description: 'View all characters found in a specific media',
    options: [
      Option({
        name: 'title',
        description: 'The title of the media',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'like',
    description: 'Like a character to be notified if someone finds them',
    aliases: ['protect', 'wish'],
    options: [
      Option({
        name: 'name',
        description: 'The name of the character',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'unlike',
    description: 'Remove a character from your likes list',
    options: [
      Option({
        name: 'name',
        description: 'The name of the character',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'likeall',
    description:
      'Like a media to be notified if someone finds any character from it',
    options: [
      Option({
        name: 'title',
        description: 'The title of the media',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'unlikeall',
    description: 'Remove a media from your likes list',
    options: [
      Option({
        name: 'title',
        description: 'The title of the media',
        autocomplete: true,
        type: Type.STRING,
      }),
    ],
  }),
  ...Command({
    name: 'likeslist',
    description: 'List all characters liked',
    options: [
      Option({
        name: 'user',
        description: 'The user of the likes list',
        type: Type.USER,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'give',
    description: 'Give characters to another user',
    aliases: ['gift'],
    options: [
      Option({
        name: 'user',
        description: 'The user you want to trade with',
        type: Type.USER,
      }),
      Option({
        name: 'give',
        description: 'The character you\'re giving away',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'give2',
        description: 'Another character you\'re giving away',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'give3',
        description: 'A third character you\'re giving away',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'trade',
    description: 'Trade characters with another user',
    aliases: ['offer'],
    options: [
      Option({
        name: 'user',
        description: 'The user you want to trade with',
        type: Type.USER,
      }),
      Option({
        name: 'give',
        description: 'The character you\'re giving away',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'take',
        description: 'The character you want to take',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'give2',
        description: 'Another character you\'re giving away',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'give3',
        description: 'A third character you\'re giving away',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'take2',
        description: 'Another character you want to take',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
      Option({
        name: 'take3',
        description: 'A third character you want to take',
        autocomplete: true,
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'steal',
    description: 'Steal a character from another user',
    options: [
      Option({
        name: 'name',
        description: 'The name of the character',
        autocomplete: true,
        type: Type.STRING,
      }),
      Option({
        name: 'sacrifices',
        description: 'The amount of stars to sacrifice for a boost',
        type: Type.INTEGER,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'help',
    description: 'Need more information? We got you',
    aliases: ['start', 'guide', 'tuto'],
    options: [
      Option({
        name: 'page',
        description: 'Specify a page to display',
        optional: true,
        type: Type.INTEGER,
        choices: [
          {
            name: 'Gacha',
            value: 0,
          },
          {
            name: 'Synthesis',
            value: 1,
          },
          {
            name: 'Party',
            value: 2,
          },
          {
            name: 'Stealing',
            value: 3,
          },
          {
            name: 'Shop',
            value: 4,
          },
          {
            name: 'Roadmap',
            value: 5,
          },
          {
            name: 'Essential Commands',
            value: 6,
          },
          {
            name: 'Other Commands',
            value: 7,
          },
          {
            name: 'Admin Commands',
            value: 8,
          },
        ],
      }),
    ],
  }),
  ...Command({
    name: 'now',
    description: 'Check what you can do right now',
    aliases: ['vote', 'tu'],
  }),
  ...Command({
    name: 'q',
    description: 'Start a quiet gacha pull with no animations',
  }),
  ...Command({
    name: 'gacha',
    description: 'Start a gacha pull',
    aliases: ['w'],
  }),
  ...Command({
    name: 'pull',
    description: 'Pull a character with a guaranteed rating',
    aliases: ['guaranteed'],
    options: [
      Option({
        name: 'stars',
        description: 'The star rating',
        type: Type.INTEGER,
        choices: spots.slice(2).toReversed(),
      }),
    ],
  }),
  ...Command({
    name: 'image',
    description: 'Change the image of a character',
    aliases: ['custom'],
    options: [
      Option({
        name: 'character',
        description: 'The name of the character',
        type: Type.STRING,
      }),
      Option({
        name: 'new_image',
        description: 'New image url',
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'nick',
    description: 'Change the nickname of a character',
    options: [
      Option({
        name: 'character',
        description: 'The name of the character',
        type: Type.STRING,
      }),
      Option({
        name: 'new_nick',
        description: 'New nickname',
        type: Type.STRING,
        optional: true,
      }),
    ],
  }),
  ...Command({
    name: 'synthesize',
    description: 'synthesize characters together to pull a new character',
    aliases: ['merge'],
    options: [
      Option({
        name: 'target',
        description: 'The target star rating of this synthesis',
        choices: spots.slice(1).toReversed(),
        type: Type.INTEGER,
      }),
    ],
  }),
  ...Command({
    name: 'logs',
    description: 'List user last few found characters',
    options: [
      Option({
        name: 'user',
        description: 'The user of logs',
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
        description: 'Use tokens to buy normal pulls',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            min_value: 1,
            max_value: 99,
            name: 'amount',
            description: 'The amount of pulls you want to buy',
            type: Type.INTEGER,
          }),
        ],
      }),
      Option({
        name: 'guaranteed',
        description: 'Use tokens to buy pulls with a guaranteed rating',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'stars',
            description: 'The star rating you want to buy',
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
        description: 'View user current party',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'user',
            description: 'The user of the party"',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'assign',
        description: 'Assign a character to your party',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'name',
            description: 'The name of the character',
            autocomplete: true,
            type: Type.STRING,
          }),
          Option({
            name: 'spot',
            description: 'The spot where you want this character',
            type: Type.INTEGER,
            optional: true,
            choices: spots,
          }),
        ],
      }),
      Option({
        name: 'swap',
        description: 'Swap two characters spots',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'a',
            description: 'The first target of the swap',
            type: Type.INTEGER,
            choices: spots,
          }),
          Option({
            name: 'b',
            description: 'The second target of the swap',
            type: Type.INTEGER,
            choices: spots,
          }),
        ],
      }),
      Option({
        name: 'remove',
        description: 'Remove a character from your party',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'spot',
            description: 'The spot the character occupies',
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
        description: 'View all stars',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'rating',
            description: 'The star rating',
            type: Type.INTEGER,
            choices: spots.toReversed(),
          }),
          Option({
            name: 'user',
            description: 'The user of the collection',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'media',
        description: 'View characters from a specific media',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'title',
            description: 'The title of the media',
            type: Type.STRING,
            autocomplete: true,
          }),
          Option({
            name: 'user',
            description: 'The user of the collection',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
    ],
  }),
  // pack management commands
  ...Command({
    name: 'packs',
    description: 'pack management commands',
    defaultPermission: Permission.MANAGE_GUILD,
    options: [
      Option({
        name: 'community',
        description: 'View all instated community packs',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'install',
        description: 'Install a community pack',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'id',
            description: 'The id of the pack',
            type: Type.STRING,
          }),
        ],
      }),
      Option({
        name: 'uninstall',
        description: 'Uninstall a pack',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'id',
            description: 'The id of the pack',
            autocomplete: true,
            type: Type.STRING,
          }),
        ],
      }),
    ],
  }),
  // non-standard commands (pack commands)
  Pack('./packs/anilist'),
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
