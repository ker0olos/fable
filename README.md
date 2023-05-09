<h1 align="center">
  <img height="100" src="./assets/splash.png" alt="Fable Logo">
</h1>

<!-- Badges  -->

<h1 align="center">

[![top.gg votes](https://top.gg/api/widget/upvotes/1041970851559522304.svg?noavatar=true)](https://top.gg/bot/1041970851559522304/vote)
[![top.gg page](https://top.gg/api/widget/servers/1041970851559522304.svg?noavatar=true)](https://top.gg/bot/1041970851559522304)

[![Discord Bot Invite](https://img.shields.io/badge/Add%20Fable%20to%20Your%20Server-blue?logo=discord&logoColor=white)](https://fable.deno.dev/invite)
[![Fable Status](https://api.checklyhq.com/v1/badges/checks/68acae41-252d-4684-89bf-face9a8b71bd?style=flat&theme=default&responseTime=true)](https://fable.instatus.com)
[![Discord Server](https://img.shields.io/discord/992416714497212518?label=discord%20server&color=blue)][discord]

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ker0olos/fable/deno.yml?branch=main&label=tests)
[![codecov](https://img.shields.io/codecov/c/gh/ker0olos/fable/main?token=3C7ZTHzGqC)](https://app.codecov.io/github/ker0olos/fable)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ker0olos/fable?color=blue&label=update%20frequency)

</h1>

<i>
  <h6 align="right">(Animated Pulls)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/227321932-2ad8d36c-e56c-46e9-91da-161b79eeb029.gif" alt="Animated Pulls">
</i>

Fable is a free, open-source gacha bot — a friendly, powerful alternative to
bots like Mudae, Sofi, Karuta. Like those bots, you can pull anime characters,
customize, and upgrade them.

There's an intuitive system to manage and customize the characters in your
servers, like adding extensions to chrome and installing apps on your phone, you
can install community-made packs that are full of new characters with a single
command.

Wanna make your own community pack? Check
[fable-community/example](https://github.com/fable-community/fable-pack-example)
for more information.

<br clear="right"/>

<p>
  <h6 align="right">(Character Descriptions)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/227323628-17674f52-bb3a-460f-965a-d316cbed7932.png" alt="Searching">
</p>

### Get Started

- **`/help`, `/tuto`**: _to learn more features and commands_
- **`/now`, `/tu`**: _check what you can do right now_
- **`/gacha`, `/w`**: _start a new gacha pull_

### Useful Links

- [How to Contribute][contributing]
- [How to Self-host][self-hosting]
- [How to Create Packs][community-packs]
- [Discord Support Server][discord]
- [Sponsor (Donate)][sponsoring]

<br/>

### FAQ

<details><summary>How can I limit Fable to 1 channel?</summary>
<p>

Go to **Server Settings** then **Integrations** then **Fable**\
From there you can control the permissions globally or even per command.

</p>
</details>

<details><summary>Can I use prefixes like $ or @Fable?</summary>
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

<details><summary>How are you keeping Fable free?</summary>
<p>

We use serverless since it's cheaper and easier. Right now the bills are very
small, but if it starts getting out of hand, we plan to rate limit servers on
how much they can call Fable each month.

We been very transparent from day one, if something happens we'll let known
instantly.

But we welcome any donations people are willing to throw us, since those the the
final decider on how much control we have over our various bills, and how much
time, and how many people are working on Fable at any giving moment.

</p>
</details>

[discord]: https://discord.gg/ceKyEfhyPQ
[topgg]: https://top.gg/bot/1041970851559522304
[sponsoring]: https://github.com/sponsors/ker0olos
[community-packs]: https://github.com/fable-community/fable-pack-example
[contributing]: https://github.com/ker0olos/fable/wiki
[self-hosting]: https://github.com/ker0olos/fable/wiki/Self-hosting
