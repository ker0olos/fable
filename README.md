<h1 align="center">
  <img height="100" src="./assets/splash.png" alt="Fable Logo">
</h1>

<!-- User badges  -->

<h1 align="center">

[![top.gg votes](https://top.gg/api/widget/upvotes/1041970851559522304.svg?noavatar=true)](https://top.gg/bot/1041970851559522304)
[![top.gg page](https://top.gg/api/widget/servers/1041970851559522304.svg?noavatar=true)](https://top.gg/bot/1041970851559522304)

[![Discord Bot Invite](https://img.shields.io/badge/Add%20Fable%20to%20Your%20Server-blue?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/api/oauth2/authorize?client_id=1041970851559522304&scope=applications.commands)

[![Discord Support Server](https://img.shields.io/discord/992416714497212518?label=Affiliated%20Discord%20Server&style=for-the-badge)][discord]

<!-- Development badges -->

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ker0olos/fable/deno.yml?branch=main&style=for-the-badge&label=tests)](https://github.com/ker0olos/fable/actions/workflows/deno.yml)
[![codecov](https://img.shields.io/codecov/c/gh/ker0olos/fable/main?style=for-the-badge&token=3C7ZTHzGqC)](https://app.codecov.io/github/ker0olos/fable)

</h1>

<i>
  <h6 align="right">(Animated Pulls)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/215555794-c8e52906-99a5-485c-9cdd-8961e168f587.gif" alt="Animated Pulls">
</i>

Fable is a free, open-source gacha[^1] bot — a simple, powerful Mudae
alternative. Like Mudae, you can pull anime characters. Unlike Mudae, there are
no premiums and no pay-to-win bullshit.

There's an intuitive system to manage and customize the characters in your
servers, like adding extensions to chrome and installing apps on your phone, you
can install community-made packs that are full of new characters with a single
command.

You can also create a party with the characters you find, challenge the tower,
your friends or other discord servers.

[^1]: Currently the default packs include anime/manga/vtubers, but you can
install other packs, e.g. video game characters or real-life celebrities. And
you can disable all anime packs entirely (In case it's a sports server or else,
we try our best to include term natural commands along with anime analogies).

> Fable is in early access. Some core features might be missing. Missing
> features include "Trading", "PVE", "PVP" (see
> [#20](https://github.com/ker0olos/fable/issues/20) for a full roadmap)

Fable is actively developed with new game modes and features frequently.

<br clear="right"/>

## Quick Start

<i>
  <h6 align="right">(Rich Character Profiles)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/216527501-8985899c-d9f3-481a-821b-068a2f4a8ad3.jpg" alt="Searching">
</i>

### Essential Commands

- **`/gacha`, `/w`**: _start a new gacha pull_
- **`/now`, `/tu`**: _check what you can do right now_
- **`/search`, `/anime`, `/manga`**: _to search for specific media_
- **`/character`, `/im`**: _to search for a specific character_
- **`/help`, `/tuto`**: _to learn more information and commands_

### Get Involved

- Send our links to a couple of friends
- Tell your favorite server's admins about us
- [Join our discord][discord]
- [Contribute to the code][contributing]

<br clear="right"/>

<h6 align="center">(Check when is the next episode is airing)</h6>
<h6 align="center">
  <img width="500" src="https://user-images.githubusercontent.com/52022280/219866921-5209e2c1-08c8-4183-9dce-f961099dc89a.png" alt="Searching">
</h6>
<h6 align="center">(Search for any anime or manga you want to know more about)</h6>
<h6 align="center">
  <img  width="500" src="https://user-images.githubusercontent.com/52022280/219867337-4f99626a-802e-412c-b26c-d3e75ed9fbae.png" alt="Searching">
</h6>

---

## FAQ

> How can I add/install a new pack on my server?

We plan to have a Marketplace command where you can browse and install popular
packs, but as of right now you'll need to know the pack's github url and run
`/packs install https://github.com/username/packname`

> How can I create a new pack?

Currently, it's only possible through editing JSON files, we recommend that you
check [fable-community/example](https://github.com/fable-community/example), it
includes most of the info you need.

> Can I use prefixes like `$`?

**No**. Fable was built from the ground up to only support slash commands,
prefixes are an entirely different thing that requires the bot to manually
monitor all incoming messages in a server. We won't add prefixes to Fable, but
you can go tell discord to add custom prefixes to "slash" commands instead of
"/" for all bots.

> How to remove/uninstall a pack from my server?

Like installing packs, run `/packs uninstall [pack-id]`. If you don't know the
id of the pack you want to uninstall, then use `/packs community` instead.

> How are you keeping Fable free?

We're using serverless for the servers and the database, which is much cheaper
to maintain right now.

If things get out of hand we'll rate limit big servers for something like 1M
command calls per month[^2]. only server owners will be required to cover what
"their" server costs us (their portion of the bill), we'll keep covering the
bill for small servers with less activity.

Fable will always remain 100% free-to-play to the players.

[^2]: Currently there are no limits on any server.

---

- Checkout <https://anilist.co>. It will help you track those 2000 anime you
  watch, and let you know when a new episode is out.

- This project wouldn't be possible without Deno. Want to learn about running
  your own discord bot at a low cost? Check the official guide at
  <https://deno.com/deploy/docs/tutorial-discord-slash>

[discord]: https://discord.gg/ceKyEfhyPQ
[contributing]: https://github.com/ker0olos/fable/wiki/Contributing
