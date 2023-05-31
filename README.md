<h1 align="center">
  <img height="100" src="./assets/splash.png" alt="Fable Logo">
</h1>

<i align="center">

[![top.gg votes](https://top.gg/api/widget/upvotes/1041970851559522304.svg?noavatar=true)][topgg]
[![top.gg page](https://top.gg/api/widget/servers/1041970851559522304.svg?noavatar=true)][topgg2]

[![Discord Bot Invite](https://img.shields.io/badge/Add%20Fable%20to%20Your%20Server-blue?logo=discord&logoColor=white)][invite]
[![Discord Server](https://img.shields.io/discord/992416714497212518?label=discord%20support%20server&color=blue)][discord]

[![Fable Status](https://api.checklyhq.com/v1/badges/checks/68acae41-252d-4684-89bf-face9a8b71bd?style=flat&theme=default&responseTime=true)](https://fable.instatus.com)
[![Fable Status 2](https://api.checklyhq.com/v1/badges/checks/086d07ba-30e7-475d-b26d-309e87e2d2bd?style=flat&theme=default&responseTime=true)](https://fable.instatus.com)

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ker0olos/fable/deno.yml?branch=main&label=tests)
[![codecov](https://img.shields.io/codecov/c/gh/ker0olos/fable/main?token=3C7ZTHzGqC)](https://app.codecov.io/github/ker0olos/fable)

</i>

<i align="center">
<details><summary>List of features and
how Fable compares to other bots</summary>
<img src="https://i.imgur.com/7ZI6dhj.png" alt="120K+ characters">

<p>
  <img align="left" src="https://i.imgur.com/IO91qt1.png" alt="100% FREE">
  <h4>100% FREE</h4>
  No more users paying to get ahead of you.

Fable has no in-app purchases, no premiums, and no bullshit.

</p>

<br clear="left"/>
<br clear="left"/>

<p>
  <img align="left" src="https://i.imgur.com/kUVI9s1.gif" alt="Animated Pulls">
  <h4>Animated Pulls</h4>
  Build anticipation and excitement with animated gacha pulls.
</p>

<br clear="left"/>
<br clear="left"/>

<p>
  <img align="left" src="https://i.imgur.com/B897tj4.png" alt="Synthesis">
  <h4>Synthesis</h4>
  Synthesis those 2000 characters you have sitting in your inventory doing nothing
  to get 2 characters that you might actually like.
</p>

<br clear="left"/>
<br clear="left"/>

<p>
  <img align="left" src="https://i.imgur.com/y0PQpOj.png" alt="Stealing">
  <h4>Stealing</h4>
  When all negotiations fails, it's fine to take what you want by force, right? Steal characters from that one annoying server member that refuses to trade.
</p>

<br clear="left"/>
<br clear="left"/>

<img src="https://i.imgur.com/478NYxi.png" alt="Fable compared to other bots">

</details>
</i>

<i>
  <h6 align="right">(Animated Pulls)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/227321932-2ad8d36c-e56c-46e9-91da-161b79eeb029.gif" alt="Animated Pulls">
</i>

Fable is a free, open-source gacha bot — a friendly, powerful alternative to
bots like Mudae, Sofi, Karuta. Like those bots, you can pull anime characters,
customize, and upgrade them.

Unlike those bots, Fable is not a cash-grab scam, everything in Fable is free,
no players can pay to get ahead.

Fable also has a powerful system to manage the characters in your server, people
can make community packs that are full of new characters and anime.

Wanna make your own community pack? Check
[fable-community/example](https://github.com/fable-community/fable-pack-example)
for more information.

#### [Add Fable to Your Server][invite]

<br clear="right"/>

<i>
  <h6 align="right">(Character Descriptions)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/227323628-17674f52-bb3a-460f-965a-d316cbed7932.png" alt="Searching">
</i>

### Get Started

- **`/now`, `/tu`**: _check what you can do right now_
- **`/gacha`, `/w`**: _start a new gacha pull_
- **`/character`, `/char`**: _search for a character_
- **`/search`, `/anime`**: _search for an anime or manga_
- **`/help`, `/tuto`**: _to learn about features and commands_

### Useful Links

- [Roadmap](https://github.com/ker0olos/fable/issues/1)
- [How to Contribute](https://github.com/ker0olos/fable/wiki)
- [How to Create Packs](https://github.com/fable-community/fable-pack-example)
- [How to Self-host](https://github.com/ker0olos/fable/wiki/Self-hosting)
- [Discord Support Server][discord]

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
[topgg]: https://top.gg/bot/1041970851559522304/vote
[topgg2]: https://top.gg/bot/1041970851559522304
[invite]: https://fable.deno.dev/invite
