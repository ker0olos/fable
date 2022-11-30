import os
from time import sleep

import requests

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

APP_ID = "1041970851559522304"
GUILD_ID = "992416714497212518"

BOT_TOKEN = os.getenv("FABLE_BOT_TOKEN")

# guild commands update instantly
url = f"https://discord.com/api/v8/applications/{APP_ID}/guilds/{GUILD_ID}/commands"

# global commands are cached and only update every hour
# url = f"https://discord.com/api/v8/applications/{APP_ID}/commands"


def set_commands(commands):
    for command in commands:
        response = requests.post(
            url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=command
        )
        print(response.json())
        # avoids the rate limit
        sleep(5)


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
                    "description": "Search for an anime/manga",
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
                    "name": "anime",
                    "description": "Approx of the anime name",
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
                    "description": "Approx of the anime name",
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
                    "description": "Approx of the anime/manga name in romaji or native",
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
                    "description": "Approx of the anime/manga name in english or native",
                    "required": True,
                }
            ],
        },
        {
            "name": "native",
            "description": "Translate an anime/manga title to its native language",
            "options": [
                {
                    "type": STRING,
                    "name": "title",
                    "description": "Approx of the anime/manga name in english or romaji",
                    "required": True,
                }
            ],
        },
    ]
)
