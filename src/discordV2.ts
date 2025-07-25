/* eslint-disable @typescript-eslint/no-explicit-any */

import utils, { ImageSize, json } from '~/src/utils.ts';

import config from '~/src/config.ts';

import {
  AllowedPings,
  Attachment,
  AvailableLocales,
  ButtonStyle,
  Emote,
  MessageFlags,
  MessageType,
  TextInputStyle,
} from '~/src/discord.ts';

import i18n from '~/src/i18n.ts';

export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
  TextInput = 4,
  UserSelect = 5,
  RoleSelect = 6,
  MentionableSelect = 7,
  ChannelSelect = 8,
  Section = 9,
  TextDisplay = 10,
  Thumbnail = 11,
  MediaGallery = 12,
  File = 13,
  Separator = 14,
  Container = 17,
}

export type MediaType = {
  url: string;
};

export const splitter = '=';

export const join = (...args: string[]): string => {
  return args.join(splitter);
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
  enraged: '<:ENRAGED:1214241073518481428>',
  stunned: '<:STUNNED:1214576287415541814>',
  slowed: '<:SLOWED:1215255510706683905>',
  sneaky: '<:sneaky:1215575668490764288>',
  skeleton: '<:loading:1227290168688508959>',
  notice: '<:notice:1370007386135334972>',
};

class Component {
  // eslint-disable-next-line no-unused-private-class-members
  #data: {
    type: ComponentType;
  };

  json(): any {
    throw new Error('json() not implemented');
  }
}

export class ActionRow extends Component {
  #data: {
    type: ComponentType.ActionRow;
    components: Component[];
  };

  constructor(...components: Component[]) {
    super();
    this.#data = {
      type: ComponentType.ActionRow,
      components: components ?? [],
    };
  }

  addComponent(component: Component): ActionRow {
    this.#data.components.push(component);
    return this;
  }

  addComponents(...components: Component[]): ActionRow {
    this.#data.components.push(...components);
    return this;
  }

  insertComponent(component: Component): ActionRow {
    this.#data.components.unshift(component);
    return this;
  }

  clearComponents(): ActionRow {
    this.#data.components = [];
    return this;
  }

  json(): any {
    return {
      ...this.#data,
      components: this.#data.components.map((component) => component.json()),
    };
  }
}

export class Button extends Component {
  #data: {
    type: ComponentType.Button;
    style: ButtonStyle;
    label?: string;
    emoji?: Emote;
    custom_id?: string;
    sku_id?: string;
    url?: string;
    disabled?: boolean;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.Button,
      style: ButtonStyle.Grey,
    };
  }

  setId(...id: string[]): Button {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setStyle(style: ButtonStyle): Button {
    this.#data.style = style;
    return this;
  }

  setLabel(label: string): Button {
    this.#data.label = utils.truncate(label ?? '', 80)!;
    return this;
  }

  setDisabled(disabled: boolean): Button {
    this.#data.disabled = disabled;
    return this;
  }

  toggle(): Button {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setEmote(emoji: Emote): Button {
    this.#data.emoji = emoji;
    return this;
  }

  setUrl(url: string): Button {
    this.#data.style = ButtonStyle.Url;
    this.#data.url = url;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

type Option = {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
  emote?: Emote;
};

export class StringSelect extends Component {
  #data: {
    type: ComponentType.StringSelect;
    custom_id: string;
    options: Option[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.StringSelect,
      custom_id: '',
      options: [],
    };
  }

  setId(...id: string[]): StringSelect {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setPlaceholder(placeholder: string): StringSelect {
    this.#data.placeholder = placeholder;
    return this;
  }

  setDisabled(disabled: boolean): StringSelect {
    this.#data.disabled = disabled;
    return this;
  }

  toggle(): StringSelect {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setOptions(...options: Option[]): StringSelect {
    if (options.length) {
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

  setMinValues(min: number): StringSelect {
    this.#data.min_values = min;
    return this;
  }

  setMaxValues(max: number): StringSelect {
    this.#data.max_values = max;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class TextInput extends Component {
  #data: {
    type: ComponentType.TextInput;
    custom_id: string;
    style: TextInputStyle;
    label: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.TextInput,
      custom_id: '',
      style: TextInputStyle.Short,
      label: '',
    };
  }

  setId(...id: string[]): TextInput {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setLabel(label: string): TextInput {
    this.#data.label = utils.truncate(label ?? '', 80)!;
    return this;
  }

  setStyle(style: TextInputStyle): TextInput {
    this.#data.style = style;
    return this;
  }

  setMinLength(min: number): TextInput {
    this.#data.min_length = min;
    return this;
  }

  setMaxLength(max: number): TextInput {
    this.#data.max_length = max;
    return this;
  }

  setRequired(required: boolean): TextInput {
    this.#data.required = required;
    return this;
  }

  setValue(value: string): TextInput {
    this.#data.value = value;
    return this;
  }

  setPlaceholder(placeholder: string): TextInput {
    this.#data.placeholder = placeholder;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class UserSelect extends Component {
  #data: {
    type: ComponentType.UserSelect;
    custom_id: string;
    placeholder?: string;
    default_values?: {
      id: string;
      type: 'user';
    }[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.UserSelect,
      custom_id: '',
    };
  }

  setId(...id: string[]): UserSelect {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setDisabled(disabled: boolean): UserSelect {
    this.#data.disabled = disabled;
    return this;
  }

  toggle(): UserSelect {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setMinValues(min: number): UserSelect {
    this.#data.min_values = min;
    return this;
  }

  setMaxValues(max: number): UserSelect {
    this.#data.max_values = max;
    return this;
  }

  setPlaceholder(placeholder: string): UserSelect {
    this.#data.placeholder = placeholder;
    return this;
  }

  setDefaultValues(
    ...defaultValues: {
      id: string;
      type: 'user';
    }[]
  ): UserSelect {
    this.#data.default_values = defaultValues;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class RoleSelect extends Component {
  #data: {
    type: ComponentType.RoleSelect;
    custom_id: string;
    placeholder?: string;
    default_values?: {
      id: string;
      type: 'role';
    }[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.RoleSelect,
      custom_id: '',
    };
  }

  setId(...id: string[]): RoleSelect {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setDisabled(disabled: boolean): RoleSelect {
    this.#data.disabled = disabled;
    return this;
  }

  toggle(): RoleSelect {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setMinValues(min: number): RoleSelect {
    this.#data.min_values = min;
    return this;
  }

  setMaxValues(max: number): RoleSelect {
    this.#data.max_values = max;
    return this;
  }

  setPlaceholder(placeholder: string): RoleSelect {
    this.#data.placeholder = placeholder;
    return this;
  }

  setDefaultValues(
    ...defaultValues: {
      id: string;
      type: 'role';
    }[]
  ): RoleSelect {
    this.#data.default_values = defaultValues;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class ChannelSelect extends Component {
  #data: {
    type: ComponentType.RoleSelect;
    custom_id: string;
    placeholder?: string;
    default_values?: {
      id: string;
      type: 'channel';
    }[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.RoleSelect,
      custom_id: '',
    };
  }

  setId(...id: string[]): ChannelSelect {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setDisabled(disabled: boolean): ChannelSelect {
    this.#data.disabled = disabled;
    return this;
  }

  toggle(): ChannelSelect {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setMinValues(min: number): ChannelSelect {
    this.#data.min_values = min;
    return this;
  }

  setMaxValues(max: number): ChannelSelect {
    this.#data.max_values = max;
    return this;
  }

  setPlaceholder(placeholder: string): ChannelSelect {
    this.#data.placeholder = placeholder;
    return this;
  }

  setDefaultValues(
    ...defaultValues: {
      id: string;
      type: 'channel';
    }[]
  ): ChannelSelect {
    this.#data.default_values = defaultValues;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class MentionableSelect extends Component {
  #data: {
    type: ComponentType.MentionableSelect;
    custom_id: string;
    placeholder?: string;
    default_values?: {
      id: string;
      type: 'user' | 'role' | 'channel';
    }[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.MentionableSelect,
      custom_id: '',
    };
  }

  setId(...id: string[]): MentionableSelect {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setDisabled(disabled: boolean): MentionableSelect {
    this.#data.disabled = disabled;
    return this;
  }

  toggle(): MentionableSelect {
    this.#data.disabled = !this.#data.disabled;
    return this;
  }

  setMinValues(min: number): MentionableSelect {
    this.#data.min_values = min;
    return this;
  }

  setMaxValues(max: number): MentionableSelect {
    this.#data.max_values = max;
    return this;
  }

  setPlaceholder(placeholder: string): MentionableSelect {
    this.#data.placeholder = placeholder;
    return this;
  }

  setDefaultValues(
    ...defaultValues: {
      id: string;
      type: 'user' | 'role' | 'channel';
    }[]
  ): MentionableSelect {
    this.#data.default_values = defaultValues;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class Section extends Component {
  #data: {
    type: ComponentType.Section;
    components: TextDisplay[];
    accessory?: Thumbnail | Button;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.Section,
      components: [],
    };
  }

  addText(component: TextDisplay): Section {
    this.#data.components.push(component);
    return this;
  }

  setAccessory(component: Thumbnail | Button): Section {
    this.#data.accessory = component;
    return this;
  }

  json(): any {
    return {
      ...this.#data,
      components: this.#data.components.map((component) => component.json()),
      accessory: this.#data.accessory?.json(),
    };
  }
}

export class TextDisplay extends Component {
  #data: {
    type: ComponentType.TextDisplay;
    content: string;
  };

  constructor(content?: string) {
    super();
    this.#data = {
      type: ComponentType.TextDisplay,
      content: content ?? '',
    };
  }

  setContent(content: string): TextDisplay {
    this.#data.content = content;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class Thumbnail extends Component {
  #data: {
    type: ComponentType.Thumbnail;
    media: MediaType;
    description?: string;
    spoiler?: boolean;
  };

  constructor(media?: MediaType) {
    super();
    this.#data = {
      type: ComponentType.Thumbnail,
      media: media ?? { url: '' },
    };
  }

  setMedia(url: string): Thumbnail {
    this.#data.media = { url };
    return this;
  }

  async setWithProxy(image: {
    url?: string;
    default?: boolean;
    size?: ImageSize;
  }): Promise<Attachment | undefined> {
    image.default ??= true;

    if (config.disableImagesProxy) {
      this.#data.media = { url: image.url! };
    } else {
      const attachment = await utils.proxy(image.url, image.size);

      if (attachment) {
        this.#data.media = { url: `attachment://${attachment.filename}` };
      }

      return attachment || undefined;
    }
  }

  setDescription(description: string): Thumbnail {
    this.#data.description = description;
    return this;
  }

  setSpoiler(spoiler: boolean): Thumbnail {
    this.#data.spoiler = spoiler;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class MediaGallery extends Component {
  #data: {
    type: ComponentType.MediaGallery;
    items: {
      media: MediaType;
      description?: string;
      spoiler?: boolean;
    }[];
  };

  constructor(
    ...items: { media: MediaType; description?: string; spoiler?: boolean }[]
  ) {
    super();
    this.#data = {
      type: ComponentType.MediaGallery,
      items,
    };
  }

  clearItems(): MediaGallery {
    this.#data.items = [];
    return this;
  }

  addItem(url: string, description?: string, spoiler?: boolean): MediaGallery {
    this.#data.items.push({
      media: { url },
      description,
      spoiler,
    });
    return this;
  }

  async addWithProxy(image: {
    url?: string;
    default?: boolean;
    size?: ImageSize;
  }): Promise<Attachment | undefined> {
    image.default ??= true;

    if (config.disableImagesProxy) {
      this.#data.items.push({
        media: { url: image.url! },
      });
    } else {
      const attachment = await utils.proxy(image.url, image.size);

      if (attachment) {
        this.#data.items.push({
          media: { url: `attachment://${attachment.filename}` },
        });
      }

      return attachment || undefined;
    }
  }

  json(): any {
    return this.#data;
  }
}

export class File extends Component {
  #data: {
    type: ComponentType.File;
    file: MediaType;
    spoiler?: boolean;
  };

  constructor(file: MediaType) {
    super();
    if (!file.url.startsWith('attachment://')) {
      throw new Error(
        `File url must start with attachment://, got ${file.url}`
      );
    }
    this.#data = {
      type: ComponentType.File,
      file,
    };
  }

  setSpoiler(spoiler: boolean): File {
    this.#data.spoiler = spoiler;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class Separator extends Component {
  #data: {
    type: ComponentType.Separator;
    divider?: boolean;
    spacing?: 1 | 2;
  };

  constructor() {
    super();
    this.#data = {
      type: ComponentType.Separator,
    };
  }

  setDivider(divider: boolean): Separator {
    this.#data.divider = divider;
    return this;
  }

  setSpacing(spacing: 1 | 2): Separator {
    this.#data.spacing = spacing;
    return this;
  }

  json(): any {
    return this.#data;
  }
}

export class Container extends Component {
  #data: {
    type: ComponentType.Container;
    components: Component[];
    accent_color?: number;
    spoiler?: boolean;
  };

  constructor(...components: Component[]) {
    super();
    this.#data = {
      type: ComponentType.Container,
      components,
    };
  }

  setAccentColor(color: number): Container {
    this.#data.accent_color = color;
    return this;
  }

  setSpoiler(spoiler: boolean): Container {
    this.#data.spoiler = spoiler;
    return this;
  }

  clearComponents(): Container {
    this.#data.components = [];
    return this;
  }

  addComponent(component: Component): Container {
    this.#data.components.push(component);
    return this;
  }

  addComponents(...components: Component[]): Container {
    this.#data.components.push(...components);
    return this;
  }

  json(): any {
    return {
      ...this.#data,
      components: this.#data.components.map((component) => component.json()),
    };
  }
}

export class Message {
  #type?: MessageType;

  #files: globalThis.File[];

  #data: {
    title?: string;
    custom_id?: string;
    flags?: number;
    content?: string;
    attachments: any[];
    components: Component[];
    allowed_mentions?: AllowedPings;
  };

  constructor(type: MessageType = MessageType.New) {
    this.#data = {
      flags: MessageFlags.ComponentsV2,
      components: [],
      attachments: [],
    };
    this.#type = type;
    this.#files = [];
  }

  addFlags(flags: MessageFlags): Message {
    this.#data.flags! += flags;
    return this;
  }

  setType(type: MessageType): Message {
    this.#type = type;
    return this;
  }

  setPing(allowedPings?: AllowedPings): Message {
    this.#data.allowed_mentions = allowedPings ?? { parse: [] };
    return this;
  }

  setId(...id: string[]): Message {
    const cid = join(...id);

    // (see https://discord.com/developers/docs/interactions/message-components#custom-id)
    if (cid.length > 100) {
      throw new Error(`id length (${cid.length}) is > 100`);
    }

    this.#data.custom_id = cid;
    return this;
  }

  setTitle(title: string): Message {
    this.#type = MessageType.Modal;
    this.#data.title = title;
    return this;
  }

  addAttachment(attachment?: Attachment): Message {
    if (attachment) {
      if (!this.#data.attachments) {
        this.#data.attachments = [];
      }

      this.#data.attachments.push({
        filename: attachment.filename,
        id: `${this.#data.attachments.length}`,
      });

      this.#files.push(
        new globalThis.File([attachment.arrayBuffer], attachment.filename, {
          type: attachment.type,
        })
      );
    }

    return this;
  }

  clearAttachments(): Message {
    this.#files = [];
    this.#data.attachments = [];
    return this;
  }

  clearComponents(): Message {
    this.#data.components = [];
    return this;
  }

  addComponent(component: Component): Message {
    this.#data.components.push(component);
    return this;
  }

  addComponents(...components: Component[]): Message {
    this.#data.components.push(...components);
    return this;
  }

  insertComponent(component: Component): Message {
    this.#data.components.unshift(component);
    return this;
  }

  json(): any {
    return {
      type: this.#type,
      data: {
        ...this.#data,
        components: this.#data.components.map((component) => component.json()),
      },
    };
  }

  send(): Response {
    const formData = new FormData();

    formData.append('payload_json', JSON.stringify(this.json()));

    // console.log('message:', JSON.stringify(this.json(), null, 2));

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

  async #http(url: string, method: 'PATCH' | 'POST'): Promise<Response> {
    const formData = new FormData();

    formData.append('payload_json', JSON.stringify(this.json().data));

    // console.log('message:', JSON.stringify(this.json(), null, 2));

    Object.entries(this.#files).forEach(([name, blob], index) => {
      formData.append(`files[${index}]`, blob, name);
    });

    let response: Response | undefined = undefined;

    try {
      response = await utils.fetchWithRetry(url, {
        method,
        body: formData,
        headers: {
          'User-Agent': `Fable (https://github.com/ker0olos/fable)`,
        },
      });
    } catch (err) {
      if (!config.sentry) {
        throw err;
      }

      utils.captureException(err as Error, {
        extra: {
          url,
          payload: JSON.stringify(this.json()),
          response: await response?.text(),
        },
      });
    }

    return response!;
  }

  patch(token: string): Promise<Response> {
    return this.#http(
      `https://discord.com/api/v10/webhooks/${config.appId}/${token}/messages/@original`,
      'PATCH'
    );
    // .then((r) => {
    //   // console.log(r, r.status, r.statusText);
    //   r.json().then((obj) => console.log(JSON.stringify(obj, null, 2)));
    // });
  }

  followup(token: string): Promise<Response> {
    return this.#http(
      `https://discord.com/api/v10/webhooks/${config.appId}/${token}`,
      'POST'
    );
  }

  static pong(): Response {
    return json({ type: MessageType.Pong });
  }

  static spinner(landscape?: boolean): Message {
    const mediaGallery = new MediaGallery({
      media: {
        url: landscape
          ? `${config.origin}/spinner3.gif`
          : `${config.origin}/spinner.gif`,
      },
    });

    return new Message().addComponent(new Container(mediaGallery));
  }

  static page({
    actionRow,
    type,
    target,
    index,
    total,
    next,
    locale,
  }: {
    type: string;
    actionRow: ActionRow;
    index: number;
    target?: string;
    next?: boolean;
    total?: number;
    locale?: AvailableLocales;
  }) {
    const prevId = index - 1 >= 0 ? index - 1 : total! - 1;

    const nextId = next ? index + 1 : 0;

    if (next || total) {
      actionRow.insertComponent(
        new Button()
          .setId(type, target ?? '', `${nextId}`, 'next')
          .setLabel(i18n.get('next', locale))
      );
    }

    actionRow.insertComponent(
      new Button()
        .setId('_')
        .setLabel(`${index + 1}${total ? `/${total}` : ''}`)
        .toggle()
    );

    if (index - 1 >= 0 || total) {
      actionRow.insertComponent(
        new Button()
          .setId(type, target ?? '', `${prevId}`, 'prev')
          .setLabel(i18n.get('prev', locale))
      );
    }
  }

  static dialog({
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
  }): Message {
    const confirmBtn = new Button().setLabel(
      confirmText ?? i18n.get('confirm', locale)
    );

    const cancelComponent = new Button()
      .setStyle(ButtonStyle.Red)
      .setLabel(cancelText ?? i18n.get('cancel', locale));

    if (Array.isArray(confirm)) {
      confirmBtn.setId(...confirm);
    } else {
      confirmBtn.setId(type!, confirm);
    }

    if (userId && targetId) {
      cancelComponent.setId('cancelv2', userId, targetId);
    } else if (userId) {
      cancelComponent.setId('cancelv2', userId);
    } else {
      cancelComponent.setId('cancelv2');
    }

    if (description) {
      message.addComponent(new TextDisplay(description));
    }

    return message.addComponent(new ActionRow(confirmBtn, cancelComponent));
  }

  static internal(id: string): Message {
    const text = new TextDisplay(
      `An Internal Error occurred and was reported.\n\`\`\`ref_id: ${id}\`\`\``
    );

    return new Message().addComponent(new Container(text));
  }
}
