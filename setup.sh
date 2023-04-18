#!/bin/bash
echo "Enter your discord application id (https://discord.com/developers/applications): "
read -r APP_ID

printf "\n"
echo "Enter your discord public key (https://discord.com/developers/applications): "
read -r PUBLIC_KEY

printf "\n"
echo "Enter your discord bot token (https://discord.com/developers/applications): "
read -r BOT_TOKEN

printf "\n"
echo "Enter a discord server id (https://github.com/ker0olos/fable/wiki/Get-Server-ID): "
read -r GUILD_ID

printf "\n"
echo "Enter a FaunaDB auth key (https://github.com/ker0olos/fable/wiki/FaunaDB): "
read -r FAUNA_SECRET

ENV="APP_ID=$APP_ID\n\
PUBLIC_KEY=$PUBLIC_KEY\n\
BOT_TOKEN=$BOT_TOKEN\n\n\
GUILD_ID=$GUILD_ID\n\n\
FAUNA_SECRET=$FAUNA_SECRET\n\n\
GACHA=1\n\
TRADING=1\n\
COMMUNITY_PACKS=1\n"

# shellcheck disable=SC2059
printf "$ENV" > .env

printf "\n"
echo "(https://discord.com/api/oauth2/authorize?client_id=$APP_ID&scope=applications.commands%20bot)"
read -r -p "Did you invite the bot to your server using the url above? ..."

printf "\n\n"
echo "Updating Discord Slash Commands"
deno run -A update_commands.ts

printf "\n"
echo "Updating GraphQL Schema"
npm install -g fauna-shell # update_schema.ts requires fauna-shell installed
deno run -A update_schema.ts

printf "\n"
echo "Updating Database Models"
deno run -A update_models.ts

printf "\n\n================================================\n\n"
printf "You are required to run \"deno task fauna\" each time you make changes inside the \"models\" directory"

printf "\n\nYou are required to run \"deno task discord\" each time you make changes to \"update_commands.ts\""
printf "\nwhich contains all the slash commands discord users will see when they type \"/\" in the chat box"

printf "\n\nRun \"deno task tunnel\" to run the bot"
printf "\nIt will output something like \"https://aaa-111-222-333-444.eu.ngrok.io\""
printf "\npaste that url into \"INTERACTIONS ENDPOINT URL\" inside (https://discord.com/developers/applications)"
printf "\nyou will need to paste the url each time you run the bot since it will change every time" 
printf "\n\n================================================\n\n"
