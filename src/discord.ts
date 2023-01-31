import { json } from 'https://deno.land/x/sift@0.6.0/mod.ts';

import utils, { ImageSize } from './utils.ts';
import config from './config.ts';

const API = `https://discord.com/api/v10`;

const splitter = '=';

export const join = (...args: string[]): string => {
  return args.join(splitter);
};

export enum MessageFlags {
  Ephemeral = 1 << 6,
  SuppressEmbeds = 1 << 2,
}

export enum MessageType {
  Pong = 1,
  New = 4,
  Update = 7,
  Suggestions = 8,
  // Modal = 9,
}

export enum InteractionType {
  Ping = 1,
  Command = 2,
  Component = 3,
  Partial = 4,
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

export type Suggestion = {
  name?: string;
  value: unknown;
};

export type Member = {
  nick?: string;
  avatar: string;
  user: User;
};

type User = {
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

  focused?: string;

  subcommand?: string;

  customType?: string;
  customValues?: string[];

  /** user is sent when invoked in a DM */
  // user?: User;

  /** member is sent when the interaction is invoked in a guild */
  member?: {
    nick?: string;
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
      guild_id?: string;
      channel_id?: string;
      // target_id?: string;
      // resolved?: unknown[];
      options?: {
        type: number;
        name: string;
        value: unknown;
        focused?: boolean;
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

    this.guildId = obj.guild_id;
    this.channelId = obj.channel_id;

    // this.user = obj.user;
    // this.message = obj?.message
    this.member = obj.member;

    // this.locale = obj.locale;
    // this.guildLocale = obj.guild_locale;

    this.options = {};

    switch (this.type) {
      case InteractionType.Partial:
      case InteractionType.Command: {
        this.name = data.name;

        // this.targetId = data!.target_id;

        if (data.options?.[0].type === 1) {
          this.subcommand = data.options?.[0].name;

          this.name += `_${this.subcommand}`;

          data.options?.[0].options?.forEach((option) => {
            this.options[option.name] = option.value as Options;

            if (option.focused) {
              this.focused = option.name;
            }
          });
        } else {
          data.options?.forEach((option) => {
            this.options[option.name] = option.value as Options;

            if (option.focused) {
              this.focused = option.name;
            }
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
    disabled?: boolean;
    url?: string;
  };

  constructor(type: ComponentType = ComponentType.Button) {
    this.#data = {
      type,
    };
  }

  setId(...id: string[]): Component {
    const cid = join(...id);
    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length <= 100) {
      this.#data.custom_id = cid;
    }
    return this;
  }

  setStyle(style: ButtonStyle | TextInputStyle): Component {
    this.#data.style = style;
    return this;
  }

  setLabel(label: string): Component {
    this.#data.label = label;
    return this;
  }

  toggle(): Component {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setEmote(emote: Emote): Component {
    this.#data.emoji = emote;
    return this;
  }

  setPlaceholder(placeholder: string): Component {
    this.#data.placeholder = placeholder;
    return this;
  }

  setUrl(url: string): Component {
    this.#data.url = url;
    return this;
  }

  // deno-lint-ignore no-explicit-any
  json(): any {
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
    type: string;
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

  constructor(type: 'rich' = 'rich') {
    this.#data = {
      type,
    };
  }

  setTitle(title?: string): Embed {
    // max characters for embed descriptions is 256
    this.#data.title = utils.truncate(title, 256);
    return this;
  }

  setUrl(url?: string): Embed {
    this.#data.url = url;
    return this;
  }

  setColor(color?: string): Embed {
    this.#data.color = utils.hexToInt(color);
    return this;
  }

  setDescription(description?: string): Embed {
    // max characters for embed descriptions is 4096
    this.#data.description = utils.truncate(
      utils.decodeDescription(description),
      4096,
    );
    return this;
  }

  setAuthor(author: { name?: string; url?: string; icon_url?: string }): Embed {
    if (author.name) {
      this.#data.author = {
        ...author,
        // author name is limited to 256
        name: utils.truncate(author.name, 256),
      };
    }
    return this;
  }

  addField(field: { name?: string; value?: string; inline?: boolean }): Embed {
    if (!this.#data.fields) {
      this.#data.fields = [];
    }

    // max amount of fields per embed is 25
    if (this.#data.fields.length >= 25) {
      return this;
    }

    if (field.name || field.value) {
      // field name is limited to 256
      // field value is limited to 1024
      this.#data.fields.push({
        ...field,
        name: utils.truncate(field.name, 256) || '\u200B',
        value: utils.truncate(field.value, 1024) || '\u200B',
      });
    }

    return this;
  }

  setImage(image: {
    url?: string;
    default?: boolean;
    disableProxy?: boolean;
    preferredSize?: ImageSize;
  }): Embed {
    if (image.url || image.default) {
      if (config.origin && image.url?.startsWith(config.origin)) {
        this.#data.image = {
          url: image.url,
        };
      } else {
        this.#data.image = {
          url: `${config.origin}/external/${
            encodeURIComponent(image.url ?? '')
          }${image.preferredSize === ImageSize.Medium ? '?size=medium' : ''}`,
        };
      }
    }
    return this;
  }

  setThumbnail(thumbnail: { url?: string; default?: boolean }): Embed {
    if (thumbnail.url || thumbnail.default) {
      if (config.origin && thumbnail.url?.startsWith(config.origin)) {
        this.#data.thumbnail = {
          url: thumbnail.url,
        };
      } else {
        this.#data.thumbnail = {
          url: `${config.origin}/external/${
            encodeURIComponent(thumbnail.url ?? '')
          }?size=thumbnail`,
        };
      }
    }
    return this;
  }

  setFooter(footer: { text?: string; icon_url?: string }): Embed {
    if (footer.text) {
      this.#data.footer = {
        ...footer,
        // footer text is limited to 2048
        text: utils.truncate(footer.text, 2048),
      };
    }
    return this;
  }

  // deno-lint-ignore no-explicit-any
  json(): any {
    return this.#data;
  }
}

export class Message {
  #type?: MessageType;

  // #files: File[];

  #suggestions: { [name: string]: Suggestion };

  #data: {
    flags?: number;
    content?: string;
    // attachments?: unknown[];
    embeds: unknown[];
    components: unknown[];
    // title?: string;
    // custom_id?: string;
  };

  constructor(type: MessageType = MessageType.New) {
    this.#type = type;
    // this.#files = [];
    this.#suggestions = {};
    this.#data = {
      embeds: [],
      components: [],
    };
  }

  setType(type: MessageType): Message {
    this.#type = type;
    return this;
  }

  setContent(content: string): Message {
    this.#data.content = content;
    return this;
  }

  setFlags(flags: MessageFlags): Message {
    this.#data.flags = flags;
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

  // addAttachment(
  //   { arrayBuffer, filename, type }: {
  //     arrayBuffer: ArrayBuffer;
  //     filename: string;
  //     type: string;
  //   },
  // ): void {
  //   if (!this.#data.attachments) {
  //     this.#data.attachments = [];
  //   }

  //   this.#data.attachments.push({
  //     id: `${this.#data.attachments.length}`,
  //     filename,
  //   });

  //   this.#files.push(
  //     new File([arrayBuffer], filename, {
  //       type,
  //     }),
  //   );
  // }

  addEmbed(embed: Embed): Message {
    // discord allows up to 10 embeds
    // but any more than 3 and they look cluttered
    if (this.#data.embeds.length < 3) {
      this.#data.embeds.push(embed.json());
    }
    return this;
  }

  addComponents(components: Component[]): Message {
    // the max amount of components allowed is 5
    if (this.#data.components.length >= 5) {
      return this;
    }

    if (components.length > 0) {
      // max amount of items per group is 5
      // (see https://discord.com/developers/docs/interactions/message-components#action-rows)
      utils.chunks(components, 5)
        .forEach((chunk) => {
          this.#data.components.push({
            type: 1,
            components: chunk.map((component) => {
              const comp = component.json();

              // labels have maximum of 80 characters
              // (see https://discord.com/developers/docs/interactions/message-components#button-object-button-structure)
              return (comp.label = utils.truncate(comp.label, 80), comp);
            }),
          });
        });
    }

    return this;
  }

  addSuggestions(...suggestions: Suggestion[]): Message {
    this.#type = MessageType.Suggestions;

    if (suggestions.length) {
      suggestions.forEach((suggestion) => {
        const name = `${suggestion.name ?? suggestion.value}`;

        if (!this.#suggestions[name]) {
          this.#suggestions[name] = {
            name: `${suggestion.name ?? suggestion.value}`,
            value: suggestion.value,
          } as Suggestion;
        }
      });
    }

    return this;
  }

  // deno-lint-ignore no-explicit-any
  json(): any {
    switch (this.#type) {
      // case MessageType.Modal:
      //   data = {
      //     title: this.#data.title,
      //     custom_id: this.#data.custom_id,
      //     components: this.#data.components,
      //   };
      //   break;
      case MessageType.Suggestions:
        return {
          type: MessageType.Suggestions,
          data: {
            // the max amount of suggestions allowed is 25
            choices: Object.values(this.#suggestions).slice(0, 25),
          },
        };
      default:
        return {
          type: this.#type,
          data: this.#data,
        };
    }
  }

  send(): Response {
    const formData = new FormData();

    formData.append('payload_json', JSON.stringify(this.json()));

    // NOTE discord timeouts responds after 3 seconds
    // if an upload will take longer than 3 seconds
    // respond first with a loading message
    // then add the attachments the follow-up message
    // this.#files.forEach((file, index) => {
    //   formData.append(`files[${index}]`, file, file.name);
    // });

    return new Response(formData, {
      status: 200,
      statusText: 'OK',
    });
  }

  async patch(token: string): Promise<Response> {
    const formData = new FormData();

    const url = `${API}/webhooks/${config.appId}/${token}/messages/@original`;

    formData.append('payload_json', JSON.stringify(this.json().data));

    // Object.entries(this.#files).forEach(([name, blob], index) => {
    //   formData.append(`files[${index}]`, blob, name);
    // });

    return await fetch(url, {
      method: 'PATCH',
      body: formData,
    });
  }

  static pong(): Response {
    return json({
      type: MessageType.Pong,
    });
  }

  static page(
    { embeds, components, id, page, total }: {
      id: string;
      embeds: Embed[];
      components?: Component[];
      page?: number;
      total: number;
    },
  ): Message {
    page = page ?? 0;
    components = components ?? [];

    const message = new Message();

    const group = [];

    const prev = new Component()
      .setId(id, `${page - 1}`)
      .setLabel(`Prev`);

    const next = new Component()
      .setId(id, `${page + 1}`)
      .setLabel(`Next`);

    const indicator = new Component().setId('_')
      .setLabel(`${page + 1}/${total}`)
      .toggle();

    if (page - 1 >= 0) {
      group.push(prev);
    }

    group.push(indicator);

    if (page + 1 < total) {
      group.push(next);
    }

    embeds.forEach((embed) => message.addEmbed(embed));

    return message.addComponents([...group, ...components]);
  }

  static internal(id: string): Message {
    return new Message().setContent(
      `An Internal Error occurred and was reported.\n\`\`\`ref_id: ${id}\`\`\``,
    );
  }
}
