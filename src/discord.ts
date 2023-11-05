import { json } from 'sift';

import i18n from './i18n.ts';
import utils, { ImageSize } from './utils.ts';

import config from './config.ts';

const splitter = '=';

enum CommandType {
  CHAT = 1,
  USER = 2,
}

export type AvailableLocales =
  // https://discord.com/developers/docs/reference#locales
  | 'en-US' // English [default, fallback]
  | 'id' // Indonesian
  | 'da' // Danish
  | 'de' // German
  | 'es-ES' // Spanish
  | 'fr' // French
  | 'hr' // Croatian
  | 'it' // Italian
  | 'lt' // Lithuanian
  | 'hu' // Hungarian
  | 'nl' // Dutch
  | 'no' // Norwegian
  | 'pl' // Polish
  | 'pt-BR' // Portuguese, Brazilian
  | 'ro' // Romanian, Romania
  | 'fi' // Finnish,
  | 'sv-SE' // Swedish
  | 'vi' // Vietnamese
  | 'tr' // Turkish
  | 'cs' // Czech
  | 'el' // Greek
  | 'bg' // Bulgarian
  | 'ru' // Russian
  | 'uk' // Ukrainian
  | 'hi' // Hindi
  | 'th' // Thai
  | 'zh-CN' // Chinese, China
  | 'ja' // Japanese
  | 'zh-TW' // Chinese, Taiwan
  | 'ko'; // Korean

export const empty = '\u200B';

export const colors = {
  red: '#a51727',
  green: '#00a86b',
};

export const emotes = {
  star: '<:star:1061016362832642098>',
  noStar: '<:no_star:1109377526662434906>',
  smolStar: '<:smolstar:1107503653956374638>',
  remove: '<:remove:1099004424111792158>',
  add: '<:add:1099004747123523644>',
  all: '<:all:1107511909999181824>',
  liked: '<:liked:1110491720375873567>',
  member: '<:partymember:1135706921312206921>',
  currentFloor: '<:currentfloor:1128724907245711452>',
  clearedFloor: '<:clearedfloor:1131872032456446053>',
  undiscoveredFloor: '<:undiscoveredfloor:1128724910609551481>',
  rightArrow: '<:rarrow:1170533290105655428>',
};

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
  Loading = 5,
  Defer = 6,
  Update = 7,
  Suggestions = 8,
  Modal = 9,
}

export enum InteractionType {
  Ping = 1,
  Command = 2,
  Component = 3,
  Partial = 4,
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
  Url = 5,
}

export enum TextInputStyle {
  Short = 1,
  Multiline = 2,
}

export type Suggestion = {
  name?: string;
  value: unknown;
};

export type Option = {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
  emote?: Emote;
};

export type Member = {
  nick?: string;
  avatar?: string;
  user: User;
};

export type User = {
  id: string;
  username: string;
  // deno-lint-ignore camelcase
  display_name?: string;
  // deno-lint-ignore camelcase
  global_name?: string;
  avatar?: string;
};

type Resolved = {
  users?: Record<string, User>;
  members?: Record<string, Omit<Member, 'user'>>;
  attachments?: Record<string, {
    ephemeral: boolean;
    content_type: string;
    url: string;
  }>;
};

type AllowedPings = {
  parse?: string[];
  users?: string[];
  roles?: string[];
};

type ComponentInternal = {
  type: number;
  // deno-lint-ignore camelcase
  custom_id?: string;
  style?: ButtonStyle | TextInputStyle;
  label?: string;
  emoji?: Emote;
  placeholder?: string;
  disabled?: boolean;
  url?: string;
  // deno-lint-ignore camelcase
  min_values?: number;
  // deno-lint-ignore camelcase
  max_values?: number;
  options?: {
    label: string;
    value: string;
    description?: string;
    default?: boolean;
    emoji?: Emote;
  }[];
};

type EmbedInternal = {
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
    // deno-lint-ignore camelcase
    icon_url?: string;
  };
  footer?: {
    text?: string;
    // deno-lint-ignore camelcase
    icon_url?: string;
  };
};

export type Emote = {
  id: string;
  name?: string;
  animated?: boolean;
};

// export const getAvatar = (
//   member: Member | Omit<Member, 'user'>,
//   user: User,
//   guildId: string,
// ) => {
//   const base = 'https://cdn.discordapp.com';

//   if (member.avatar) {
//     return `${base}/guilds/${guildId}/users/${user.id}/avatars/${member.avatar}.png`;
//   } else if (user.avatar) {
//     return `${base}/avatars/${user.id}/${user.avatar}.png`;
//   } else {
//     // TODO discriminator are going away
//     // as of now we I have no idea how default avatar is going to work
//     // they depend on discriminators
//     // @see https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
//     // return `${base}/embed/avatars/${Number(user.discriminator) % 5}.png`;
//     return `${base}/embed/avatars/2.png`;
//   }
// };

export class Interaction<Options> {
  id: string;
  token: string;
  type: InteractionType;

  guildId: string;
  targetId?: string;

  resolved?: Resolved;

  name?: string;
  options: {
    [key: string]: Options;
  };

  focused?: string;

  subcommand?: string;

  customType?: string;
  customValues?: string[];

  reference?: {
    embeds: EmbedInternal[];
    components: { type: 1; components: ComponentInternal[] };
  };

  /** user is sent when the interaction is invoked in a DM */
  // user?: User;

  /** member is sent when the interaction is invoked in a guild */
  member: Member;

  /** available on all interaction types except PING */
  locale?: AvailableLocales;

  /** guild's preferred locale (if invoked in a guild) */
  guildLocale?: AvailableLocales;

  constructor(body: string) {
    const obj = JSON.parse(body);

    const data: {
      type: number;
      name: string;
      guild_id: string;
      resolved?: Resolved;
      target_id?: string;
      values?: string[];
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
    } = obj.data;

    this.id = obj.id;
    this.token = obj.token;
    this.type = obj.type;

    this.reference = obj.message;

    this.guildId = obj.guild_id;

    // this.user = obj.user;
    // this.message = obj?.message
    this.member = obj.member;

    this.locale = obj.locale;
    this.guildLocale = obj.guild_locale;

    this.options = {};

    // transform context-menu commands into chat commands
    if (data?.type === CommandType.USER) {
      this.type = InteractionType.Command;

      this.name = data.name.toLowerCase();

      this.resolved = data.resolved;
      this.targetId = data.target_id;

      this.options['user'] = data.target_id as Options;

      return;
    }

    switch (this.type) {
      case InteractionType.Partial:
      case InteractionType.Command: {
        this.name = data.name;

        this.resolved = data.resolved;
        this.targetId = data.target_id;

        if (data.options?.[0].type === 1) {
          this.subcommand = data.options?.[0].name;

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
      case InteractionType.Modal:
      case InteractionType.Component: {
        const custom = data.custom_id.split(splitter);

        this.customType = custom[0];
        this.customValues = data.values?.length ? data.values : custom.slice(1);

        // if (data.components) {
        //   // deno-lint-ignore no-explicit-any
        //   data.components[0].components.forEach((component: any) => {
        //     this.options[component.custom_id] = component.value as Options;
        //   });
        // }

        break;
      }
      default:
        break;
    }
  }
}

export class Component {
  #data: ComponentInternal;

  constructor(type: ComponentType = ComponentType.Button) {
    this.#data = {
      type,
    };
  }

  setId(...id: string[]): Component {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
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

  setDisabled(disabled: boolean): Component {
    this.#data.disabled = disabled;
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

  setOptions(options: Option[]): Component {
    if (options.length) {
      this.#data.type = ComponentType.StringSelect;
      this.#data.options = options.slice(0, 25).map((option) => ({
        label: option.label,
        value: option.value,
        description: option.description,
        default: option.default,
        emoji: option.emote,
      }));
    }
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
            this.#data.style = ButtonStyle.Url;
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
  #data: EmbedInternal;

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

  getFieldsCount(): number {
    return this.#data.fields?.length ?? 0;
  }

  setImage(image: {
    url?: string;
    default?: boolean;
    proxy?: boolean;
    size?: ImageSize;
  }): Embed {
    const size = image.size === ImageSize.Medium ? '?size=medium' : '';

    image.default = image.default ?? true;
    image.proxy = image.proxy ?? true;

    if (image.url || image.default) {
      if (
        image.url?.startsWith('attachment://') ||
        (config.origin && image.url?.startsWith(config.origin) ||
          (!image.default && !image.proxy))
      ) {
        this.#data.image = {
          // deno-lint-ignore no-non-null-assertion
          url: image.url!,
        };
      } else {
        this.#data.image = {
          url: `${config.origin}/external/${
            encodeURIComponent(image.url ?? '')
          }${size}`,
        };
      }
    }
    return this;
  }

  setThumbnail(
    thumbnail: {
      url?: string;
      preview?: boolean;
      default?: boolean;
      proxy?: boolean;
    },
  ): Embed {
    thumbnail.default = thumbnail.default ?? true;
    thumbnail.proxy = thumbnail.proxy ?? true;

    if (thumbnail.url || thumbnail.default) {
      if (
        thumbnail.url?.startsWith('attachment://') ||
        (config.origin && thumbnail.url?.startsWith(config.origin) ||
          (!thumbnail.default && !thumbnail.proxy))
      ) {
        this.#data.thumbnail = {
          // deno-lint-ignore no-non-null-assertion
          url: thumbnail.url!,
        };
      } else {
        this.#data.thumbnail = {
          url: `${config.origin}/external/${
            encodeURIComponent(thumbnail.url ?? '')
          }?size=${thumbnail.preview ? 'preview' : 'thumbnail'}`,
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

  #files: File[];

  #suggestions: { [name: string]: Suggestion };

  #data: {
    title?: string;
    custom_id?: string;
    flags?: number;
    content?: string;
    // deno-lint-ignore no-explicit-any
    attachments: any[];
    embeds: unknown[];
    components: unknown[];
    // title?: string;
    // custom_id?: string;
    allowed_mentions?: AllowedPings;
  };

  constructor(type: MessageType = MessageType.New) {
    this.#type = type;
    this.#files = [];
    this.#suggestions = {};
    this.#data = {
      embeds: [],
      attachments: [],
      components: [],
    };
  }

  clone(): Message {
    const cloned = new Message();
    cloned.#files = [...this.#files];
    cloned.#data.attachments = [...this.#data.attachments];
    cloned.#data.embeds = [...this.#data.embeds];
    return cloned;
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

  setPing(allowedPings?: AllowedPings): Message {
    this.#data.allowed_mentions = allowedPings ?? { parse: [] };
    return this;
  }

  setId(id: string): Message {
    this.#data.custom_id = id;
    return this;
  }

  setTitle(title: string): Message {
    this.#type = MessageType.Modal;
    this.#data.title = title;
    return this;
  }

  addAttachment({ arrayBuffer, filename, type }: {
    arrayBuffer: ArrayBuffer;
    filename: string;
    type: string;
  }): Message {
    if (!this.#data.attachments) {
      this.#data.attachments = [];
    }

    this.#data.attachments.push({
      filename,
      id: `${this.#data.attachments.length}`,
    });

    this.#files.push(new File([arrayBuffer], filename, { type }));

    return this;
  }

  clearEmbedsAndAttachments(): Message {
    this.#files = [];
    this.#data.embeds = [];
    this.#data.attachments = [];
    return this;
  }

  clearAttachments(): Message {
    this.#files = [];
    this.#data.attachments = [];
    return this;
  }

  addEmbed(embed: Embed): Message {
    // discord allows up to 10 embeds
    if (this.#data.embeds.length < 10) {
      this.#data.embeds.push(embed.json());
    }

    return this;
  }

  replaceEmbed(index: number, embed: Embed): Message {
    this.#data.embeds[index] = embed.json();

    return this;
  }

  insertEmbed(index: number, embed: Embed): Message {
    this.#data.embeds.splice(index, 0, embed.json());

    return this;
  }

  deleteEmbeds(index: number, deleteCount?: number): Message {
    this.#data.embeds.splice(index, deleteCount ?? 1);

    return this;
  }

  addComponents(components: Component[]): Message {
    this.#data.components.push(...components.map((component) => {
      const comp = component.json();
      // labels have maximum of 80 characters
      // (see https://discord.com/developers/docs/interactions/message-components#button-object-button-structure)
      return (comp.label = utils.truncate(comp.label, 80), comp);
    }));

    return this;
  }

  insertComponents(components: Component[]): Message {
    this.#data.components = [
      ...components.map((component) => {
        const comp = component.json();
        // labels have maximum of 80 characters
        // (see https://discord.com/developers/docs/interactions/message-components#button-object-button-structure)
        return (comp.label = utils.truncate(comp.label, 80), comp);
      }),
      ...this.#data.components,
    ];

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
      case MessageType.Suggestions:
        return {
          type: MessageType.Suggestions,
          data: {
            // the max amount of suggestions allowed is 25
            choices: Object.values(this.#suggestions).slice(0, 25),
          },
        };
      default: {
        const components: {
          type: 1;
          components: unknown[];
        }[] = [];

        const chunks = utils
          // max amount of items per group is 5
          // (see https://discord.com/developers/docs/interactions/message-components#action-rows)
          .chunks(this.#data.components, 5)
          .slice(0, 5);

        chunks.forEach((chunk) => {
          components.push({
            type: 1,
            components: chunk,
          });
        });

        if (this.#type === MessageType.Modal) {
          return {
            type: MessageType.Modal,
            data: {
              title: this.#data.title,
              custom_id: this.#data.custom_id,
              components,
            },
          };
        }

        return {
          type: this.#type,
          data: {
            ...this.#data,
            components,
          },
        };
      }
    }
  }

  send(): Response {
    const formData = new FormData();

    formData.append('payload_json', JSON.stringify(this.json()));

    // NOTE discord timeouts responds after 3 seconds
    // if an upload will take longer than 3 seconds
    // respond first with a loading message
    // then add the attachments the follow-up message
    this.#files.forEach((file, index) => {
      formData.append(`files[${index}]`, file, file.name);
    });

    return new Response(formData, {
      status: 200,
      statusText: 'OK',
    });
  }

  async #http(
    url: string,
    method: 'PATCH' | 'POST',
  ): Promise<Response> {
    const formData = new FormData();

    formData.append('payload_json', JSON.stringify(this.json().data));

    Object.entries(this.#files).forEach(([name, blob], index) => {
      formData.append(`files[${index}]`, blob, name);
    });

    const response = await utils.fetchWithRetry(url, {
      method,
      body: formData,
    });

    console.log(method, response?.status, response?.statusText);

    if (response?.status === 429) {
      const extra = {
        ...(await response.json()),
        headers: {
          'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit'),
          'X-RateLimit-Remaining': response.headers.get(
            'X-RateLimit-Remaining',
          ),
          'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset'),
          'X-RateLimit-Reset-After': response.headers.get(
            'X-RateLimit-Reset-After',
          ),
          'X-RateLimit-Bucket': response.headers.get('X-RateLimit-Bucket'),
          'X-RateLimit-Scope': response.headers.get('X-RateLimit-Scope'),
        },
      };

      utils.captureException(new Error('429: Too Many Requests'), {
        extra,
      });

      if (config.instatus) {
        await utils.captureOutage(config.instatus);
      }
    }

    return response;
  }

  async patch(token: string): Promise<Response> {
    // discord doesn't wait for the initial message to apply patches
    // causing a race condition where any delay to the initial message
    // will cause the patch to apply first
    // then applying the initial message overriding the patch
    // this can be easily fixed on there size by invalidating late initial messages
    // but discord never fixes things after they release them

    // delaying patches means our users are the ones to suffer
    // and it won't work if the initial message doesn't apply in those 35ms
    // but it's the only workaround I can think of
    if (config.deploy) {
      await utils.sleep(35 / 1000);
    }

    return this.#http(
      `https://discord.com/api/v10/webhooks/${config.appId}/${token}/messages/@original`,
      'PATCH',
    );
  }

  async followup(token: string): Promise<Response> {
    if (config.deploy) {
      await utils.sleep(50 / 1000);
    }

    return this.#http(
      `https://discord.com/api/v10/webhooks/${config.appId}/${token}`,
      'POST',
    );
  }

  static pong(): Response {
    return json({
      type: MessageType.Pong,
    });
  }

  static page(
    { message, type, target, index, total, next, locale }: {
      type: string;
      message: Message;
      index: number;
      target?: string;
      next?: boolean;
      total?: number;
      locale?: AvailableLocales;
    },
  ): Message {
    const group: Component[] = [];

    // deno-lint-ignore no-non-null-assertion
    const prevId = index - 1 >= 0 ? index - 1 : total! - 1;

    const nextId = next ? index + 1 : 0;

    if (index - 1 >= 0 || total) {
      group.push(
        new Component()
          .setId(type, target ?? '', `${prevId}`, 'prev')
          .setLabel(i18n.get('prev', locale)),
      );
    }

    group.push(
      new Component().setId('_')
        .setLabel(
          `${index + 1}${total ? `/${total}` : ''}`,
        )
        .toggle(),
    );

    if (next || total) {
      group.push(
        new Component()
          .setId(type, target ?? '', `${nextId}`, 'next')
          .setLabel(i18n.get('next', locale)),
      );
    }

    return message.insertComponents(group);
  }

  static dialog(
    {
      type,
      description,
      message,
      confirm,
      confirmText,
      cancelText,
      userId,
      targetId,
      locale,
    }: {
      type?: string;
      userId?: string;
      targetId?: string;
      description?: string;
      confirm: string | string[];
      message: Message;
      confirmText?: string;
      cancelText?: string;
      locale?: AvailableLocales;
    },
  ): Message {
    const confirmComponent = new Component()
      .setLabel(confirmText ?? i18n.get('confirm', locale));

    const cancelComponent = new Component()
      .setStyle(ButtonStyle.Red)
      .setLabel(cancelText ?? i18n.get('cancel', locale));

    if (Array.isArray(confirm)) {
      confirmComponent.setId(...confirm);
    } else {
      // deno-lint-ignore no-non-null-assertion
      confirmComponent.setId(type!, confirm);
    }

    if (userId && targetId) {
      cancelComponent.setId('cancel', userId, targetId);
    } else if (userId) {
      cancelComponent.setId('cancel', userId);
    } else {
      cancelComponent.setId('cancel');
    }

    if (description) {
      message
        .addEmbed(new Embed().setDescription(description));
    }

    return message
      .insertComponents([
        confirmComponent,
        cancelComponent,
      ]);
  }

  static internal(id: string): Message {
    return new Message()
      .addEmbed(
        new Embed().setDescription(
          `An Internal Error occurred and was reported.\n\`\`\`ref_id: ${id}\`\`\``,
        ),
      );
  }
}
