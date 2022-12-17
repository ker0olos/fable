import { json } from './net.ts';

import { decodeDescription, hexToInt } from './utils.ts';

const APP_ID = Deno.env.get('APP_ID');

const API = `https://discord.com/api/v10`;

export enum MessageType {
  Ping = 1,
  New = 4,
  Loading = 5,
  Update = 7,
  AutocompleteResult = 8,
  Modal = 9,
}

export enum InteractionType {
  Ping = 1,
  SlashCommand = 2,
  Component = 3,
  SlashCommandAutocomplete = 4,
  Modal = 5,
}

export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
  TextInput = 4,
  UserSelect = 5,
  RoleSelect = 6,
  MentionableSelect = 7,
  ChannelSelect = 8,
}

export enum ButtonColor {
  Blue = 1,
  Grey = 2,
  Green = 3,
  Red = 4,
}

export class Component {
  _data: {
    type: number;
    custom_id?: string;
    style?: ButtonColor;
    label?: string;
    url?: string;
  };

  constructor(type: ComponentType = ComponentType.Button) {
    this._data = {
      type,
    };
  }

  setStyle(style: ButtonColor) {
    this._data.style = style;
    return this;
  }

  setLabel(label: string) {
    this._data.label = label;
    return this;
  }

  setUrl(url: string) {
    this._data.url = url;
    this._data.style = 5;
    return this;
  }

  setId(id: string) {
    this._data.custom_id = id;
    return this;
  }

  _done(): unknown {
    return this._data;
  }
}

export class Embed {
  _data: {
    type: string;
    title?: string;
    description?: string;
    color?: number;
    fields?: {
      name: string;
      value: string;
      inline: boolean;
    }[];
    thumbnail?: {
      url: string;
    };
    image?: {
      url: string;
    };
    author?: {
      name: string;
    };
    footer?: {
      text: string;
    };
  };

  constructor() {
    this._data = {
      type: 'rich',
    };
  }

  setTitle(title: string) {
    this._data.title = title;
    return this;
  }

  setColor(color?: string) {
    this._data.color = hexToInt(color);
    return this;
  }

  setDescription(description?: string) {
    this._data.description = decodeDescription(description);
    return this;
  }

  setAuthor(name?: string) {
    if (name) {
      this._data.author = {
        name,
      };
    }
    return this;
  }

  setThumbnail(url?: string) {
    if (url) {
      this._data.thumbnail = {
        url,
      };
    }
    return this;
  }

  addField(name: string, value: string, inline = false) {
    if (!this._data.fields) {
      this._data.fields = [];
    }
    this._data.fields.push({
      name,
      value,
      inline,
    });
    return this;
  }

  setImage(url?: string) {
    if (url) {
      this._data.image = {
        url,
      };
    }
    return this;
  }

  setFooter(text?: string, suffix = '') {
    if (text) {
      this._data.footer = {
        text: text + suffix,
      };
    }
    return this;
  }

  _done(): unknown {
    return {
      ...this._data,
      type: 2,
    };
  }
}

export class Message {
  _type?: MessageType;
  _data: {
    content?: string;
    embeds: unknown[];
    components: unknown[];
    choices?: string[];
  };

  constructor(type: MessageType = MessageType.New) {
    this._type = type;
    this._data = {
      embeds: [],
      components: [],
    };
  }

  setContent(content: string): Message {
    this._data.content = content;
    return this;
  }

  addEmbed(embed: Embed): Message {
    this._data.embeds.push(embed._done());
    return this;
  }

  addComponents(components: Component[]): Message {
    if (components.length > 0) {
      this._data.components.push({
        type: 1,
        components: components.slice(0, 5).map((component) =>
          component._done()
        ),
      });
    }
    return this;
  }

  addChoices(...choices: string[]): Message {
    if (choices.length > 0) {
      this._type = MessageType.AutocompleteResult;
      if (!this._data.choices) {
        this._data.choices = [];
      }
      this._data.choices.push(...choices);
    }
    return this;
  }

  json(): Response {
    return json({
      type: this._type,
      data: this._type === MessageType.AutocompleteResult
        ? { choices: this._data.choices }
        : {
          embeds: this._data.embeds,
          content: this._data.content,
          components: this._data.components,
        },
    });
  }

  async patch(token: string): Promise<Response> {
    const url = `${API}/webhooks/${APP_ID}/${token}/messages/@original`;

    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: this._data.embeds,
        content: this._data.content,
        components: this._data.components,
      }),
    });
  }

  static pong() {
    return json({
      type: 1,
    });
  }

  // deno-lint-ignore no-explicit-any
  static error(err: any) {
    return json({
      type: MessageType.New,
      data: {
        content: err?.message ?? err,
      },
    });
  }
}

type User = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  banner?: string;
};

export class Interaction<Options> {
  id: string;
  token: string;
  type: InteractionType;

  guild_id?: string;
  channel_id?: string;

  message?: unknown;
  data?: unknown;

  name?: string;
  options?: {
    [key: string]: {
      type: number;
      value: Options;
    };
  };

  customType?: string;
  customValue?: string;

  /** user is sent when invoked in a DM */
  // user?: User;

  /** member is sent when the interaction is invoked in a guild */
  member?: {
    avatar: string;
    user: User;
  };

  /** available on all interaction types except PING */
  locale?: string;

  /** guild's preferred locale (if invoked in a guild) */
  guild_locale?: string;

  constructor(body: string) {
    const obj = JSON.parse(body);

    this.id = obj.id;
    this.type = obj.type;
    this.token = obj.token;

    this.guild_id = obj.guild_id;
    this.channel_id = obj.channel_id;

    const data: {
      id: string;
      name: string;
      type: string;
      target_id?: string;
      resolved?: unknown[];
      options?: {
        type: number;
        name: string;
        focused: boolean;
        value: unknown;
      }[];
    } & {
      custom_id: string;
      component_type: ComponentType;
      values?: unknown[];
    } = this.data = obj.data;

    // this.message = obj?.message

    // this.user = obj.user;
    this.member = obj.member;

    this.locale = obj.locale;
    this.guild_locale = obj.guild_locale;

    switch (this.type) {
      case InteractionType.SlashCommand:
      case InteractionType.SlashCommandAutocomplete: {
        this.name = data!.name.replaceAll(' ', '_').toLowerCase();
        this.options = {};
        data!.options?.forEach((option) => {
          this.options![option.name] = {
            type: option.type,
            value: option.value as Options,
          };
        });
        break;
      }
      case InteractionType.Component: {
        const custom = data!.custom_id.split(':');
        this.customType = custom[0];
        this.customValue = custom[1];
        break;
      }
      default:
        break;
    }
  }
}
