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

APP_ID = "1041970851559522304"
GUILD_ID = "992416714497212518"

BOT_TOKEN = os.getenv("FABLE_BOT_TOKEN")

# guild commands update instantly
url = f"https://discord.com/api/v10/applications/{APP_ID}/guilds/{GUILD_ID}/commands"  # noqa: E501

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
            "name": "search",
            "description": "Search for an anime/manga",
            "options": [
                {
                    "type": STRING,
                    "name": "query",
                    "description": "The title for an anime/manga",
                    "required": True,
                }
            ],
        },
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
        },
        {
            "name": "songs",
            "description": "Search for the theme songs of an anime",
            "options": [
                {
                    "type": STRING,
                    "name": "query",
                    "description": "The title of an anime/manga",
                    "required": True,
                }
            ],
        },
        {
            "name": "next_episode",
            "description": "Find when is the next episode for an anime",
            "options": [
                {
                    "type": STRING,
                    "name": "anime",
                    "description": "The title of an anime",
                    "required": True,
                }
            ],
        },
        {
            "name": "gacha",
            "description": "An experimental/ephemeral gacha command",
            "options": [],
        },
        {
            "name": "english",
            "description": "Translate an anime/manga title to english",
            "options": [
                {
                    "type": STRING,
                    "name": "title",
                    "description": "The title of an anime/manga name in romaji or native",  # noqa: E501
                    "required": True,
                }
            ],
        },
        {
            "name": "romaji",
            "description": "Translate an anime/manga title to romaji",
            "options": [
                {
                    "type": STRING,
                    "name": "title",
                    "description": "The title of an anime/manga name in english or native",  # noqa: E501
                    "required": True,
                }
            ],
        },
        {
            "name": "native",
            "description": "Translate an anime/manga title to its native language",  # noqa: E501
            "options": [
                {
                    "type": STRING,
                    "name": "title",
                    "description": "The title of an anime/manga name in english or romaji",  # noqa: E501
                    "required": True,
                }
            ],
        },
    ]
)

# print_commands()
