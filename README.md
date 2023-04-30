<h1 align="center">
  <img height="100" src="./assets/splash.png" alt="Fable Logo">
</h1>

<!-- User badges  -->

<h1 align="center">

[![top.gg votes](https://top.gg/api/widget/upvotes/1041970851559522304.svg?noavatar=true)](https://top.gg/bot/1041970851559522304/vote)
[![top.gg page](https://top.gg/api/widget/servers/1041970851559522304.svg?noavatar=true)](https://top.gg/bot/1041970851559522304)

[![Discord Bot Invite](https://img.shields.io/badge/Add%20Fable%20to%20Your%20Server-blue?style=for-the-badge&logo=discord&logoColor=white)](https://fable.deno.dev/invite)

[![Discord Support Server](https://img.shields.io/discord/992416714497212518?label=Discord%20Support%20Server&style=for-the-badge)][discord]

<!-- Development badges -->

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ker0olos/fable/deno.yml?branch=main&style=for-the-badge&label=tests)
[![codecov](https://img.shields.io/codecov/c/gh/ker0olos/fable/main?style=for-the-badge&token=3C7ZTHzGqC)](https://app.codecov.io/github/ker0olos/fable)
![GitHub Last Commit](https://img.shields.io/github/last-commit/ker0olos/fable?style=for-the-badge&label=Last%20Update)

</h1>

<i>
  <h6 align="right">(Animated Pulls)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/227321932-2ad8d36c-e56c-46e9-91da-161b79eeb029.gif" alt="Animated Pulls">
</i>

Fable is a free, open-source gacha bot — a simple, powerful Mudae alternative.
Like Mudae, you can pull anime characters. Unlike Mudae, there are no premiums
and no pay-to-win bullshit.

There's an intuitive system to manage and customize the characters in your
servers, like adding extensions to chrome and installing apps on your phone, you
can install community-made packs that are full of new characters with a single
command.

You can try an online demo of Fable before adding it to your server by going to
<https://fable.deno.dev>

Fable is actively developed with new game modes and features frequently.

<br clear="right"/>

<i>
  <h6 align="right">(Rich Character Profiles)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/227323628-17674f52-bb3a-460f-965a-d316cbed7932.png" alt="Searching">
</i>

### Get Started

- **`/help`, `/tuto`**: _to learn more features and commands_
- **`/now`, `/tu`**: _check what you can do right now_
- **`/gacha`, `/w`**: _start a new gacha pull_
- **`/search`, `/anime`, `/manga`**: _to search for specific media_
- **`/character`, `/char`**: _to search for a specific character_

### Get Involved

- [Join our discord][discord]
- Tell your favorite server's admins about us
- [Contribute to the code][contributing]

<br clear="right"/>

<h6 align="center">(Search for any anime or manga you want to know more about)</h6>
<h6 align="center">
  <img  width="500" src="https://user-images.githubusercontent.com/52022280/227324461-079c4bca-ae1d-4df9-bea5-99f02eba68d5.png" alt="Searching">
</h6>

---

## FAQ

<details><summary>How can I limit Fable to 1 channel?</summary>
<p>

Go to **Server Settings** then **Integrations** then **Fable**\
From there you can control the permissions globally or even per command.

</p>
</details>

<details><summary>Can I use prefixes like `$`?</summary>
<p>

**No**. Fable was built from the ground up to only support slash commands,
prefixes are an entirely different thing that requires the bot to manually
monitor all incoming messages in a server. We won't add prefixes to Fable, but
you can go tell discord to add custom prefixes to "slash" commands instead of
"/" for all bots.

</p>
</details>

<details><summary>How can I install a new pack on my server?</summary>
<p>

We plan to have a `/marketplace` command where you can browse and install
popular packs but since Fable is still new a there ain't that many people making
packs, You will have to join our discord to manually check the packs currently
available. Then install them by running
`/packs install github: https://github.com/username/packname`

> `Manage Server` permission is required to install packs on "your" server

</p>
</details>

<details><summary>How can I create a new pack?</summary>
<p>

Currently, it's only possible through editing JSON files. Please visit check
[fable-community/example](https://github.com/fable-community/fable-pack-example),
it includes most of the info you need.

</p>
</details>

<details><summary>How to uninstall a pack from my server?</summary>
<p>

Use `/packs community` or `/packs uninstall id: pack-id`.

</p>
</details>

[discord]: https://discord.gg/ceKyEfhyPQ
[contributing]: https://github.com/ker0olos/fable/wiki/Contributing
