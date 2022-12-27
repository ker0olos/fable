import { json } from 'https://deno.land/x/sift@0.6.0/mod.ts';

import { decodeDescription, hexToInt } from './utils.ts';

const APP_ID = Deno.env.get('APP_ID');

// const BOT_TOKEN = Deno.env.get('BOT_TOKEN');

const API = `https://discord.com/api/v10`;

export enum MessageType {
  Ping = 1,
  New = 4,
  Update = 7,
  AutocompleteResult = 8,
  Modal = 9,
}

export enum InteractionType {
  Ping = 1,
  Command = 2,
  Component = 3,
  CommandAutocomplete = 4,
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

export enum ButtonStyle {
  Blue = 1,
  Grey = 2,
  Green = 3,
  Red = 4,
}

export enum TextInputStyle {
  Short = 1,
  Multiline = 2,
}

export type User = {
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

  guildId?: string;
  channelId?: string;
  targetId?: string;

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
  customValues?: string[];

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
  guildLocale?: string;

  constructor(body: string) {
    const obj = JSON.parse(body);
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
    } & { // Message Component
      custom_id: string;
      component_type: ComponentType;
      values?: unknown[];
    } & { // Modal Submit
      custom_id: string;
      components: { type: 1; components: unknown[] }[];
    } = this.data = obj.data;

    this.id = obj.id;
    this.type = obj.type;
    this.token = obj.token;

    // this.guildId = obj.guild_id;
    // this.channelId = obj.channel_id;

    // this.user = obj.user;
    // this.message = obj?.message
    this.member = obj.member;

    // this.locale = obj.locale;
    // this.guildLocale = obj.guild_locale;

    this.options = {};

    switch (this.type) {
      case InteractionType.Command:
      case InteractionType.CommandAutocomplete: {
        this.targetId = data!.target_id;
        this.name = data!.name.replaceAll(' ', '_').toLowerCase();
        data!.options?.forEach((option) => {
          this.options![option.name] = {
            type: option.type,
            value: option.value as Options,
          };
        });

        break;
      }
      case InteractionType.Modal:
      case InteractionType.Component: {
        const custom = data!.custom_id.split(':');

        this.customType = custom[0];
        this.customValues = custom.slice(1);

        if (data.components) {
          // deno-lint-ignore no-explicit-any
          data.components[0].components.forEach((component: any) => {
            this.options![component.custom_id] = {
              type: component.type,
              value: component.value as Options,
            };
          });
        }

        break;
      }
      default:
        break;
    }
  }
}

export class Component {
  _data: {
    type: number;
    custom_id?: string;
    style?: ButtonStyle | TextInputStyle;
    label?: string;
    placeholder?: string;
    url?: string;
  };

  constructor(type: ComponentType = ComponentType.Button) {
    this._data = {
      type,
    };
  }

  setId(id: string) {
    this._data.custom_id = id;
    return this;
  }

  setStyle(style: ButtonStyle | TextInputStyle) {
    this._data.style = style;
    return this;
  }

  setLabel(label: string) {
    this._data.label = label;
    return this;
  }

  setPlaceholder(placeholder: string) {
    this._data.type = ComponentType.TextInput;
    this._data.placeholder = placeholder;
    return this;
  }

  setUrl(url: string) {
    this._data.url = url;
    this._data.style = 5;
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
    //
    choices?: string[];
    //
    title?: string;
    custom_id?: string;
  };

  constructor(type: MessageType = MessageType.New) {
    this._type = type;
    this._data = {
      embeds: [],
      components: [],
    };
  }

  setType(type: MessageType) {
    this._type = type;
    return this;
  }

  setContent(content: string) {
    this._data.content = content;
    return this;
  }

  setId(id: string) {
    this._data.custom_id = id;
    return this;
  }

  setTitle(title: string) {
    this._type = MessageType.Modal;
    this._data.title = title;
    return this;
  }

  addEmbed(embed: Embed) {
    this._data.embeds.push(embed._done());
    return this;
  }

  addComponents(components: Component[]) {
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

  addChoices(...choices: string[]) {
    if (choices.length > 0) {
      this._type = MessageType.AutocompleteResult;
      if (!this._data.choices) {
        this._data.choices = [];
      }
      this._data.choices.push(...choices);
    }
    return this;
  }

  send(): Response {
    let data;

    switch (this._type) {
      case MessageType.AutocompleteResult:
        data = { choices: this._data.choices };
        break;
      case MessageType.Modal:
        data = {
          title: this._data.title,
          custom_id: this._data.custom_id,
          components: this._data.components,
        };
        break;
      default:
        data = {
          embeds: this._data.embeds,
          content: this._data.content,
          components: this._data.components,
        };
        break;
    }

    return json({
      type: this._type,
      data,
    });
  }

  async patch(token: string): Promise<Response> {
    const url = `${API}/webhooks/${APP_ID}/${token}/messages/@original`;

    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        embeds: this._data.embeds,
        content: this._data.content,
        components: this._data.components,
      }),
    });
  }

  // async reply(channel: string, target: string): Promise<Response> {
  //   const url = `${API}/channels/${channel}/messages`;

  //   return await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json; charset=utf-8',
  //       'Authorization': `Bot ${BOT_TOKEN}`,
  //     },
  //     body: JSON.stringify({
  //       embeds: this._data.embeds,
  //       content: this._data.content,
  //       components: this._data.components,
  //       message_reference: {
  //         message_id: target,
  //       },
  //     }),
  //   });
  // }

  static pong() {
    return json({
      type: 1,
    });
  }

  static loading() {
    return json({
      type: 5,
    });
  }

  static deferred() {
    return json({
      type: 6,
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
