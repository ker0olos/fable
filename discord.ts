import { decodeDescription, hexToInt } from './utils.ts';

export enum MESSAGE_TYPE {
  NEW = 4,
  PING = 1,
  UPDATE = 7,
}

export enum COMPONENT_TYPE {
  GROUP = 1,
  BUTTON = 2,
}

export enum BUTTON_COLOR {
  BLUE = 1,
  GREY = 2,
  GREEN = 3,
  RED = 4,
}

export class Component {
  _data: {
    custom_id: string;
    type: COMPONENT_TYPE;
    style?: BUTTON_COLOR;
    label?: string;
    components?: Component[];
  };

  constructor(type: COMPONENT_TYPE) {
    this._data = {
      type,
      custom_id: (Math.random() + 1).toString(36).substring(7),
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

  addComponent(component: Component) {
    if (!this._data.components) {
      this._data.components = [];
    }
    this._data.components.push(component);
    return this;
  }

  // deno-lint-ignore no-explicit-any
  _done(): any {
    return {
      ...this._data,
      components: this._data.components?.map((component) => component._done()),
    };
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

  setFooter(text?: string) {
    if (text) {
      this._data.footer = {
        text,
      };
    }
    return this;
  }

  // deno-lint-ignore no-explicit-any
  _done(): any {
    return this._data;
  }
}

export class Message {
  _type: MESSAGE_TYPE;
  _data: {
    content?: string;
    embeds: Embed[];
    components: Component[];
  };

  constructor(type: MESSAGE_TYPE) {
    this._type = type;
    this._data = {
      embeds: [],
      components: [],
    };
  }

  static ping() {
    return JSON.stringify({
      type: 1,
    });
  }

  // deno-lint-ignore no-explicit-any
  static error(err: any) {
    return JSON.stringify({
      type: MESSAGE_TYPE.NEW,
      data: {
        content: typeof err === 'string' ? err : JSON.stringify(err),
      },
    });
  }

  setContent(content: string): Message {
    this._data.content = content;
    return this;
  }

  addEmbed(embed: Embed): Message {
    this._data.embeds.push(embed);
    return this;
  }

  addComponent(component: Component): Message {
    this._data.components.push(component);
    return this;
  }

  done(): string {
    return JSON.stringify({
      type: this._type,
      data: {
        content: this._data.content,
        embeds: this._data.embeds.map((embeds) => embeds._done()),
        components: this._data.components.map((component) => component._done()),
      },
    });
  }
}
