import { load as Dotenv } from 'https://deno.land/std@0.177.0/dotenv/mod.ts';

import { green } from 'https://deno.land/std@0.177.0/fmt/colors.ts';

import { Manifest } from './src/types.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

const APP_ID = Deno.env.get('APP_ID');

const BOT_TOKEN = Deno.env.get('BOT_TOKEN');

const GUILD_ID = Deno.env.get('GUILD_ID');

if (!APP_ID) {
  throw new Error('APP_ID is not defined');
}

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined');
}

enum Type {
  'SUB_COMMAND' = 1,
  'SUB_COMMAND_GROUP' = 2,
  'STRING' = 3,
  'INTEGER' = 4, //  Includes all channel types + categories
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
};

type Command = {
  name: string;
  description: string;
  options?: ReturnType<typeof Option>[];
  aliases?: string[];
  defaultPermission?: Permission;
  devOnly?: boolean;
};

type Choice = {
  name: string;
  value: string | number;
};

const Option = (
  { name, description, type, autocomplete, choices, options, optional }: Option,
) => ({
  name,
  description,
  autocomplete,
  type: type.valueOf(),
  required: !optional,
  choices,
  options,
});

const Command = ({
  name,
  description,
  options,
  aliases,
  defaultPermission,
  devOnly,
}: Command) => {
  if (devOnly && !GUILD_ID) {
    return [];
  }

  if (devOnly) {
    description = `${description} (Developer Only)`;
  }

  const commands = [{
    name,
    description,
    'default_member_permissions': defaultPermission,
    options,
  }];

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

async function put(commands: Command[]): Promise<void> {
  if (!GUILD_ID) {
    console.log('Updating global commands for production bot\n\n');
  } else {
    console.log('Updating guild commands for dev bot\n\n');
  }

  if (commands.length > 100) {
    throw new Error('the maximum number of commands allowed is 100');
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
    // console.log(response.status, response.statusText);
    console.log(green('OK'));
  }
}

await put([
  // standard gacha commands
  // uses characters and media from all packs
  ...Command({
    name: 'search',
    aliases: ['anime', 'manga', 'media'],
    description: 'Search for a specific series',
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
    ],
  }),
  ...Command({
    name: 'character',
    description: 'Search for a specific character',
    aliases: ['char', 'im'],
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
    name: 'help',
    description: 'New to Fable? We got you',
    aliases: ['start', 'guide', 'tuto'],
  }),
  ...Command({
    name: 'now',
    description: 'Check what you can do right now',
    aliases: ['checklist', 'cl', 'tu'],
  }),
  ...Command({
    name: 'gacha',
    description: 'Start a gacha pull',
    aliases: ['w'],
  }),
  ...Command({
    name: 'pull',
    description: 'Start a quiet gacha pull with no animation',
    aliases: ['q'],
  }),
  ...Command({
    name: 'fake_pull',
    description: 'Preform a fake gacha pull',
    devOnly: true,
    options: [
      Option({
        name: 'id',
        description: 'The id of the character',
        type: Type.STRING,
      }),
    ],
  }),
  // party management
  ...Command({
    name: 'party',
    description: 'party management commands',
    aliases: ['team', 'p'],
    options: [
      Option({
        name: 'view',
        description: 'View your current party',
        type: Type.SUB_COMMAND,
        optional: true,
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
            choices: [{
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
            }],
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
            choices: [{
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
            }],
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
        description: 'View all your stars',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'rating',
            description: 'The star rating',
            type: Type.INTEGER,
            choices: [{
              name: '5',
              value: 5,
            }, {
              name: '4',
              value: 4,
            }, {
              name: '3',
              value: 3,
            }, {
              name: '2',
              value: 2,
            }, {
              name: '1',
              value: 1,
            }],
          }),
          Option({
            name: 'user',
            description: 'List someone else\'s stars',
            type: Type.USER,
            optional: true,
          }),
        ],
      }),
      Option({
        name: 'media',
        description: 'View your characters from a specific media',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'title',
            description: 'The title of the media',
            autocomplete: true,
            type: Type.STRING,
          }),
          Option({
            name: 'user',
            description: 'View someone else\'s stars',
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
        name: 'builtin',
        description: 'List all the builtin packs',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'community',
        description: 'List all instated community packs',
        type: Type.SUB_COMMAND,
        optional: true,
      }),
      Option({
        name: 'validate',
        description: 'Validate a community pack\'s manifest',
        type: Type.SUB_COMMAND,
        optional: true,
        options: [
          Option({
            name: 'github',
            description: 'A github repository url',
            type: Type.STRING,
          }),
          Option({
            name: 'ref',
            description: 'A ref to a branch or commit sha',
            type: Type.STRING,
            optional: true,
          }),
        ],
      }),
    ],
  }),
  // non-standard commands (pack commands)
  Pack('./packs/anilist'),
]);
