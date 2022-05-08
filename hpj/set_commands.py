import sys
from time import sleep

import requests

APP_ID = "890282812748472380"
GUILD_ID = "514280909537542158"

if not sys.argv[1]:
    print("BOT_TOKEN missing")
    sys.exit(1)

BOT_TOKEN = sys.argv[1]

SUB_COMMAND = 1
SUB_COMMAND_GROUP = 2
STRING = 3
INTEGER = 4
BOOLEAN = 5
USER = 6
CHANNEL = 7
ROLE = 8
MENTIONABLE = 9  # Includes users and roles
NUMBER = 10  # Any double between -2^53 and 2^53

# guild commands update instantly
url = f"https://discord.com/api/v8/applications/{APP_ID}/guilds/{GUILD_ID}/commands"


def set_commands(commands):
    for command in commands:
        response = requests.post(
            url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=command
        )
        print(response.json())
        sleep(1)


def delete_command(command_id):
    response = requests.delete(
        f"{url}/{command_id}", headers={"Authorization": f"Bot {BOT_TOKEN}"}
    )

    print(f'deleted command "{command_id}": {response.status_code}')


set_commands([{"name": "token", "description": "Get a token for an interaction."}])
