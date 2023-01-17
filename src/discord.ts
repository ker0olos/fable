import { json } from 'https://deno.land/x/sift@0.6.0/mod.ts';

import utils from './utils.ts';
import config from './config.ts';

const API = `https://discord.com/api/v10`;

const splitter = '=';

export function join(...args: string[]): string {
  return args.join(splitter);
}

export enum MessageType {
  Ping = 1,
  New = 4,
  Update = 7,
  // AutocompleteResult = 8,
  // Modal = 9,
}

export enum InteractionType {
  Ping = 1,
  Command = 2,
  Component = 3,
  // CommandAutocomplete = 4,
  // Modal = 5,
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

export type Emote = {
  id: string;
  name?: string;
  animated?: boolean;
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
  options: {
    [key: string]: Options;
  };

  subcommand?: string;

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
      // id: string;
      name: string;
      type: string;
      // target_id?: string;
      // resolved?: unknown[];
      options?: {
        type: number;
        name: string;
        focused?: boolean;
        value: unknown;
        options?: {
          type: number;
          name: string;
          focused?: boolean;
          value: unknown;
        }[];
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
    this.token = obj.token;
    this.type = obj.type;

    // this.guildId = obj.guild_id;
    // this.channelId = obj.channel_id;

    // this.user = obj.user;
    // this.message = obj?.message
    this.member = obj.member;

    // this.locale = obj.locale;
    // this.guildLocale = obj.guild_locale;

    this.options = {};

    switch (this.type) {
      // case InteractionType.CommandAutocomplete:
      case InteractionType.Command: {
        this.name = data.name;

        // this.targetId = data!.target_id;

        if (data.options?.[0].type === 1) {
          this.subcommand = data.options?.[0].name;

          this.name += `_${this.subcommand}`;

          data.options?.[0].options?.forEach((option) => {
            this.options[option.name] = option.value as Options;
          });
        } else {
          data.options?.forEach((option) => {
            this.options[option.name] = option.value as Options;
          });
        }

        break;
      }
      // case InteractionType.Modal:
      case InteractionType.Component: {
        const custom = data.custom_id.split(splitter);

        this.customType = custom[0];
        this.customValues = custom.slice(1);

        if (data.components) {
          // deno-lint-ignore no-explicit-any
          data.components[0].components.forEach((component: any) => {
            this.options[component.custom_id] = component.value as Options;
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
  #data: {
    type: number;
    custom_id?: string;
    style?: ButtonStyle | TextInputStyle;
    label?: string;
    emoji?: Emote;
    placeholder?: string;
    url?: string;
  };

  constructor(type: ComponentType = ComponentType.Button) {
    this.#data = {
      type,
    };
  }

  setId(id: string) {
    this.#data.custom_id = id;
    return this;
  }

  setStyle(style: ButtonStyle | TextInputStyle) {
    this.#data.style = style;
    return this;
  }

  setLabel(label: string) {
    this.#data.label = label;
    return this;
  }

  setEmote(emote: Emote) {
    this.#data.emoji = emote;
    return this;
  }

  setPlaceholder(placeholder: string) {
    this.#data.type = ComponentType.TextInput;
    this.#data.placeholder = placeholder;
    return this;
  }

  setUrl(url: string) {
    this.#data.url = url;
    return this;
  }

  json() {
    if (!this.#data.style) {
      switch (this.#data.type) {
        case ComponentType.TextInput:
          this.#data.style = TextInputStyle.Short;
          break;
        case ComponentType.Button:
          if (this.#data.url) {
            this.#data.style = 5;
          } else {
            this.#data.style = ButtonStyle.Grey;
          }
          break;
        default:
          break;
      }
    }

    return this.#data;
  }
}

export class Embed {
  #data: {
    type: number;
    title?: string;
    url?: string;
    description?: string;
    color?: number;
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
    thumbnail?: {
      url: string;
    };
    image?: {
      url: string;
    };
    author?: {
      name?: string;
      url?: string;
      icon_url?: string;
    };
    footer?: {
      text?: string;
      icon_url?: string;
    };
  };

  constructor() {
    this.#data = {
      type: 2,
    };
  }

  setTitle(title?: string) {
    this.#data.title = title;
    return this;
  }

  setUrl(url?: string) {
    this.#data.url = url;
    return this;
  }

  setColor(color?: string) {
    this.#data.color = utils.hexToInt(color);
    return this;
  }

  setDescription(description?: string) {
    this.#data.description = utils.decodeDescription(description);
    return this;
  }

  setAuthor(author: { name?: string; url?: string; icon_url?: string }) {
    if (author.name) {
      this.#data.author = author;
    }
    return this;
  }

  addField(field: { name: string; value: string; inline?: boolean }) {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    if (field) {
      this.#data.fields.push(field);
    }

    return this;
  }

  setImage(image: { url?: string; noProxy?: boolean; default?: boolean }) {
    if (image.url || image.default) {
      this.#data.image = {
        url: config.origin && image.url?.startsWith(config.origin)
          ? image.url
          : `${config.origin}/external/${image.url}`,
      };
    }
    return this;
  }

  setThumbnail(thumbnail: { url?: string; default?: boolean }) {
    if (thumbnail.url || thumbnail.default) {
      this.#data.thumbnail = {
        url: config.origin && thumbnail.url?.startsWith(config.origin)
          ? thumbnail.url
          : `${config.origin}/external/${thumbnail.url}`,
      };
    }
    return this;
  }

  setFooter(footer: { text?: string; icon_url?: string }) {
    if (footer.text) {
      this.#data.footer = footer;
    }
    return this;
  }

  json() {
    return this.#data;
  }
}

export class Message {
  #type?: MessageType;

  #data: {
    content?: string;
    embeds: unknown[];
    components: unknown[];
  };
  //  & {
  //   // choices?: string[];
  // } & {
  //   // title?: string;
  //   // custom_id?: string;
  // };

  constructor(type: MessageType = MessageType.New) {
    this.#type = type;
    this.#data = {
      embeds: [],
      components: [],
    };
  }

  setType(type: MessageType) {
    this.#type = type;
    return this;
  }

  setContent(content: string) {
    this.#data.content = content;
    return this;
  }

  // setId(id: string) {
  //   this.#data.custom_id = id;
  //   return this;
  // }

  // setTitle(title: string) {
  //   this.#type = MessageType.Modal;
  //   this.#data.title = title;
  //   return this;
  // }

  addEmbed(embed: Embed) {
    this.#data.embeds.push(embed.json());
    return this;
  }

  addComponents(components: Component[]) {
    if (components.length > 0) {
      // max amount of items per group is 5
      utils.chunks(components, 5)
        .forEach((chunk) => {
          this.#data.components.push({
            type: 1,
            components: chunk.map((component) => {
              const comp = component.json();

              // labels have maximum of 80 characters
              return (comp.label = utils.truncate(comp.label, 80), comp);
            }),
          });
        });
    }

    return this;
  }

  // addChoices(...choices: string[]) {
  //   if (choices.length > 0) {
  //     this.#type = MessageType.AutocompleteResult;
  //     if (!this.#data.choices) {
  //       this.#data.choices = [];
  //     }
  //     this.#data.choices.push(...choices);
  //   }
  //   return this;
  // }

  embedsCount() {
    return this.#data.embeds.length;
  }

  componentsCount() {
    return this.#data.components.length;
  }

  json() {
    let data;

    switch (this.#type) {
      // case MessageType.AutocompleteResult:
      //   data = { choices: this.#data.choices };
      //   break;
      // case MessageType.Modal:
      //   data = {
      //     title: this.#data.title,
      //     custom_id: this.#data.custom_id,
      //     components: this.#data.components,
      //   };
      //   break;
      default:
        data = {
          content: this.#data.content,
          embeds: this.#data.embeds.slice(0, 3),
          components: this.#data.components.slice(0, 5),
        };
        break;
    }

    return {
      type: this.#type,
      data,
    };
  }

  send(): Response {
    return json(this.json());
  }

  async patch(token: string): Promise<Response> {
    const url = `${API}/webhooks/${config.appId}/${token}/messages/@original`;

    return await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        embeds: this.#data.embeds,
        content: this.#data.content,
        components: this.#data.components,
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

  // static loading() {
  //   return json({
  //     type: 5,
  //   });
  // }

  // static deferred() {
  //   return json({
  //     type: 6,
  //   });
  // }

  static page(
    { current, id, index, total }: {
      id: string;
      total: number;
      index?: number;
      current: Embed;
    },
  ) {
    index = index ?? 0;

    const message = new Message();

    current.setFooter({
      text: `${index + 1}/${total}`,
    });

    const navigation = [];

    if (index - 1 >= 0) {
      navigation.push(
        new Component().setId(`${id}:${index - 1}`).setLabel(`Prev`),
      );
    }

    if (index + 1 < total) {
      navigation.push(
        new Component().setId(`${id}:${index + 1}`).setLabel(`Next`),
      );
    }

    return message.addEmbed(current).addComponents(navigation);
  }

  static content(content: string) {
    return json({
      type: MessageType.New,
      data: {
        content,
      },
    });
  }

  static internal(id: string) {
    return new Message().setContent(
      `An Internal Error occurred and was reported.\n\n\`\`\`ref_id: ${id}\`\`\``,
    );
  }
}
