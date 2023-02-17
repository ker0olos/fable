<h1 align="center">
  <img height="100" src="./assets/splash.png" alt="Fable Logo">
</h1>

<!-- User badges  -->

<h1 align="center">

[![Discord Bot Invite](https://img.shields.io/badge/Add%20Fable%20to%20Your%20Server-blue?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/api/oauth2/authorize?client_id=1041970851559522304&scope=applications.commands)

[![Affiliated Discord Server](https://img.shields.io/discord/992416714497212518?label=Affiliated%20Discord%20Server&style=for-the-badge)][discord]

<!-- Development badges -->

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ker0olos/fable/deno.yml?branch=main&style=for-the-badge&label=tests)](https://github.com/ker0olos/fable/actions/workflows/deno.yml)
[![Codecov](https://img.shields.io/codecov/c/gh/ker0olos/fable/main?style=for-the-badge&token=3C7ZTHzGqC)](https://codecov.io/github/ker0olos/fable)

</h1>

<i>
  <h6 align="right">(Animated Pulls)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/215555794-c8e52906-99a5-485c-9cdd-8961e168f587.gif" alt="Animated Pulls">
</i>

Fable is a free, open-source gacha[^1] bot — a simple, powerful Mudae
alternative. Like Mudae, you can pull anime characters. Unlike Mudae, there are
no premiums and no pay-to-win bullshit.

There's a intuitive system to manage and customize the characters in your
servers, you can add community-made packs that are full of new characters with a
single command.

Fable is actively developed with new game modes and features frequently.

[^1]: Currently the default packs include anime/manga/vtubers, but you can add
other packs, e.g. video game characters or real life celebrities. And you can
disable the anime packs entirety (Incase it's a sports server or else, we try
our best to include term naturel commands along with anime analogies).

> **Warning** Fable is in early access. Some features might be missing. Missing
> features include "Trading" (see
> [#20](https://github.com/ker0olos/fable/issues/20) for a full roadmap)

<br clear="right"/>

## Quick Start

<i>
  <h6 align="right">(Rich Character Profiles)</h6>
  <img align="right" width="250" src="https://user-images.githubusercontent.com/52022280/216527501-8985899c-d9f3-481a-821b-068a2f4a8ad3.jpg" alt="Searching">
</i>

### Essential Commands

- `/gacha`, `/w`: to start a new gacha pull
- `/now`, `/tu`: to check what you can do right now
- `/search`, `/anime` or `/manga`: to search for specific series
- `/character`, `/im`: to search for a specific character

### Get Involved

- Star the github repo
- Send our links to a couple of friends
- Tell your favorite server's admins about us
- [Join our discord][discord]
- [Contribute to the code][contributing]

<br clear="right"/>

## FAQ

<!-- TODO -->
<!-- > How can I add a new pack to my server? -->

<!-- TODO -->
<!-- > How to disable/remove a pack from my server? -->

> How can I create a new pack?

We recommend that you check
[fable-community/example](https://github.com/fable-community/example), it has a
great quick start guide.

> Can I use prefixes like `$`

No, Fable was built from the ground up to only support slash commands, prefixes
are an entirely different thing that requires the bot to manually monitor all
incoming messages in a server. We won't add prefixes to Fable, but you can go
tell discord to add custom prefixes to "slash" commands instead of "/" for all
bots.

> How/why are you keeping Fable free?

We're using serverless for the servers and the database, which is much cheaper
to maintain right now.

If things get out of hand we'll rate limit big servers for something like 1M
command calls per month. So most people won't be affected, only big server
owners will be required to cover for what "their" server costs us (their portion
of the bill), we'll keep covering the bill for small servers with less activity.

TL;DR Fable will always remain 100% free-to-play to the players.

Alternatively, you can donate to a dev member account directly if you want (not
Fable itself), Obviously, you won't be getting special rewards for those
donations. We're not shameless to take money for IPs we don't own, even if was
legal, which I doubt it is.

## Credits

Our core team who are responsible for reviewing code and making decisions on the
direction of the project:

- [@ker0olos](https://github.com/ker0olos) — Kerolos Zaki (Wholesome) —
  Wholesome#6355

- Checkout our friends at <https://anilist.co>. It can help you track those 2000
  animes you watch, it can also tell you whenever a new episode or season is
  available.

- This project wouldn't been possible without Deno. Want to learn about running
  your own discord bot with low-cost? Check the official guide at
  <https://deno.com/deploy/docs/tutorial-discord-slash>

[discord]: https://discord.gg/ceKyEfhyPQ
[contributing]: https://github.com/ker0olos/fable/wiki/Contributing
