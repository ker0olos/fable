import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

import {
  assertSpyCall,
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.168.0/testing/mock.ts";

import {
  ButtonStyle,
  Component,
  ComponentType,
  Embed,
  Interaction,
  InteractionType,
  Message,
  MessageType,
} from "../src/discord.ts";

Deno.test("interactions", async (test) => {
  await test.step("command", () => {
    const body = JSON.stringify({
      id: "body_id",
      token: "body_token",
      type: InteractionType.Command,
      member: {
        user: {
          id: "user_id",
        },
      },
      data: {
        name: "Data Name",
        options: [{
          name: "text",
          value: "text",
        }, {
          name: "boolean",
          value: true,
        }, {
          name: "number",
          value: 420,
        }],
      },
    });

    const interaction = new Interaction<string | number | boolean>(body);

    assertEquals(interaction.id, "body_id");
    assertEquals(interaction.token, "body_token");

    assertEquals(interaction.type, 2);

    assertEquals(interaction.name, "data_name");

    assertEquals(interaction.member!.user.id, "user_id");

    assertEquals(interaction.options!["text"], "text");
    assertEquals(interaction.options!["boolean"], true);
    assertEquals(interaction.options!["number"], 420);
  });

  await test.step("interactions", () => {
    const body = JSON.stringify({
      id: "body_id",
      token: "body_token",
      type: InteractionType.Component,
      member: {
        user: {
          id: "user_id",
        },
      },
      data: {
        custom_id: "test_id:abc:123",
        components: [{
          type: 1,
          components: [{
            custom_id: "text",
            value: "text",
          }, {
            custom_id: "boolean",
            value: true,
          }, {
            custom_id: "number",
            value: 420,
          }],
        }],
      },
    });

    const interaction = new Interaction<string | number | boolean>(body);

    assertEquals(interaction.id, "body_id");
    assertEquals(interaction.token, "body_token");

    assertEquals(interaction.type, 3);

    assertEquals(interaction.customType, "test_id");
    assertEquals(interaction.customValues, ["abc", "123"]);

    assertEquals(interaction.member!.user.id, "user_id");

    assertEquals(interaction.options!["text"], "text");
    assertEquals(interaction.options!["boolean"], true);
    assertEquals(interaction.options!["number"], 420);
  });
});

// why are embeds test and  components test set up differently?
// because embeds can contain all parameters
// while components have parameters that can't overlap

Deno.test("embeds", async (test) => {
  const embed = new Embed();

  embed
    .setAuthor({ name: "a", url: "b", icon_url: "c" })
    .setTitle("abc")
    .setDescription("abc")
    .setUrl("abc")
    .setColor("#3E5F8A")
    .setThumbnail({ url: "abc" })
    .setImage({ url: "abc" })
    .setFooter({ text: "a", icon_url: "b" });

  assertEquals(embed.json().type, 2);
  assertEquals(embed.json().fields, undefined);

  await test.step("author", () => {
    assertEquals(embed.json().author!.name, "a");
    assertEquals(embed.json().author!.url, "b");
    assertEquals(embed.json().author!.icon_url, "c");
  });

  await test.step("title", () => {
    assertEquals(embed.json().title, "abc");
  });

  await test.step("description", () => {
    assertEquals(embed.json().description!, "abc");
  });

  await test.step("url", () => {
    assertEquals(embed.json().url, "abc");
  });

  await test.step("color", () => {
    assertEquals(embed.json().color!, 4087690);
  });

  await test.step("thumbnail", () => {
    assertEquals(embed.json().thumbnail!.url, "abc");
  });

  await test.step("image", () => {
    assertEquals(embed.json().image!.url, "abc");
  });

  await test.step("fields", () => {
    embed.addField({ name: "a", value: "b" });
    embed.addField({ name: "c", value: "d", inline: true });

    assertEquals(embed.json().fields!.length, 2);

    assertEquals(embed.json().fields![0], {
      name: "a",
      value: "b",
    });

    assertEquals(embed.json().fields![1], {
      name: "c",
      value: "d",
      inline: true,
    });
  });

  await test.step("footer", () => {
    assertEquals(embed.json().footer!.text, "a");
    assertEquals(embed.json().footer!.icon_url, "b");
  });
});

Deno.test("components", async (test) => {
  const component = new Component();

  component
    .setId("custom_id")
    .setLabel("label");

  assertEquals(component.json(), {
    type: 2,
    custom_id: "custom_id",
    label: "label",
  });

  await test.step("new with non-default type", () => {
    assertEquals(new Component(ComponentType.UserSelect).json().type, 5);
  });

  await test.step("new with placeholder", () => {
    const component = new Component();

    component.setPlaceholder("placeholder");

    assertEquals(component.json(), {
      type: 4,
      placeholder: "placeholder",
    });
  });

  await test.step("new with url", () => {
    const component = new Component();

    component.setUrl("url");

    assertEquals(component.json(), {
      type: 2,
      style: 5,
      url: "url",
    });
  });

  await test.step("set style", () => {
    const component = new Component();

    component.setStyle(ButtonStyle.Blue);

    assertEquals(component.json(), {
      type: 2,
      style: 1,
    });
  });
});

Deno.test("messages", async (test) => {
  const message = new Message();

  assertEquals(message.embeds(), 0);
  assertEquals(message.components(), 0);

  message.addEmbed(new Embed());
  message.addComponents([new Component()]);

  assertEquals(message.embeds(), 1);
  assertEquals(message.components(), 1);

  assertEquals(message.json(), {
    type: 4,
    data: {
      content: undefined,
      components: [{
        type: 1,
        components: [{
          type: 2,
          label: undefined,
        }],
      }],
      embeds: [{
        type: 2,
      }],
    },
  });

  await test.step("normal", () => {
    const message = new Message();

    assertEquals(message.json().type, 4);

    message.setContent("content");

    assertEquals(message.json().data.content, "content");
  });

  await test.step("set type", () => {
    const message = new Message(MessageType.Update);

    assertEquals(message.json().type, 7);
  });
});

Deno.test("static messages", async (test) => {
  await test.step("pong", async () => {
    const message = Message.pong();

    const json = await message.json();

    assertEquals(json, {
      type: 1,
    });
  });

  await test.step("content", async () => {
    const message = Message.content("content");

    assertEquals(await message.json(), {
      type: 4,
      data: {
        content: "content",
      },
    });
  });

  await test.step("internal error", () => {
    const message = Message.internal("id");

    assertEquals(message.json(), {
      type: 4,
      data: {
        content:
          "An Internal Error occurred and was reported.\n\n```ref_id: id```",
        components: [],
        embeds: [],
      },
    });
  });
});

Deno.test("patch messages", async () => {
  const fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore no-explicit-any
    () => true as any,
  );

  try {
    const message = new Message();

    await message.patch("token");

    assertSpyCalls(fetchStub, 1);

    assertSpyCall(fetchStub, 0, {
      args: [
        "https://discord.com/api/v10/webhooks/app_id/token/messages/@original",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({
            content: undefined,
            embeds: [],
            components: [],
          }),
        },
      ],
      // deno-lint-ignore no-explicit-any
      returned: true as any,
    });
  } finally {
    fetchStub.restore();
    configStub.restore();
  }
});
