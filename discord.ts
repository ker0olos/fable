import { json } from './net.ts';

import { decodeDescription, hexToInt } from './utils.ts';

export enum MESSAGE_TYPE {
  NEW = 4,
  PING = 1,
  UPDATE = 7,
  LOADING = 5,
}

export enum BUTTON_COLOR {
  BLUE = 1,
  GREY = 2,
  GREEN = 3,
  RED = 4,
}

export class Component {
  _data: {
    type: number;
    custom_id?: string;
    style?: BUTTON_COLOR;
    label?: string;
    url?: string;
  };

  constructor() {
    this._data = {
      type: 2,
    };
  }

  setStyle(style: BUTTON_COLOR) {
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

  // deno-lint-ignore no-explicit-any
  _done(): any {
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

  // deno-lint-ignore no-explicit-any
  _done(): any {
    return {
      ...this._data,
      type: 2,
    };
  }
}

export class Message {
  _type: MESSAGE_TYPE;
  _data: {
    content?: string;
    // deno-lint-ignore no-explicit-any
    embeds: any[];
    // deno-lint-ignore no-explicit-any
    components: any[];
  };

  constructor(type: MESSAGE_TYPE) {
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

  json(): Response {
    return json({
      type: this._type,
      data: {
        embeds: this._data.embeds,
        content: this._data.content,
        components: this._data.components,
      },
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
      type: MESSAGE_TYPE.NEW,
      data: {
        content: err?.message ?? err,
      },
    });
  }
}
