import os

import requests

SUB_COMMAND = 1
SUB_COMMAND_GROUP = 2
STRING = 3
INTEGER = 4  # Includes all channel types + categories
BOOLEAN = 5
USER = 6
CHANNEL = 7  # Includes all channel types + categories
ROLE = 8
MENTIONABLE = 9  # Includes users and roles
NUMBER = 10  # Any double between -2^53 and 2^53
ATTACHMENT = 11  # attachment object

APP_ID = "994920973927186463"
GUILD_ID = "992416714497212518"

BOT_TOKEN = os.getenv("CATS_BOT_TOKEN")

# guild commands update instantly
url = f"https://discord.com/api/v10/applications/{APP_ID}/guilds/{GUILD_ID}/commands"

# global commands are cached and only update every hour
# url = f"https://discord.com/api/v8/applications/{APP_ID}/commands"


def print_commands():
    response = requests.get(url, headers={"Authorization": f"Bot {BOT_TOKEN}"})
    print(response.json())


def set_commands(commands):
    response = requests.put(
        url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=commands
    )
    print(response.json())


def delete_command(command_id):
    response = requests.delete(
        f"{url}/{command_id}", headers={"Authorization": f"Bot {BOT_TOKEN}"}
    )

    print(f'deleted command "{command_id}": {response.status_code}')


set_commands(
    [
        {
            "name": "roll",
            "description": "Roll a ten-sided dice.",
            "options": [
                {
                    "type": INTEGER,
                    "name": "amount",
                    "description": "The number of dices to roll",
                    "required": True,
                }
            ],
        }
    ]
)

# print_commands()
