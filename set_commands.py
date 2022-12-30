import os
from enum import Enum
from typing import List

import requests

APP_ID = "1041970851559522304"
GUILD_ID = "992416714497212518"

BOT_TOKEN = os.getenv("FABLE_BOT_TOKEN")

# guild commands update instantly
url = f"https://discord.com/api/v10/applications/{APP_ID}/guilds/{GUILD_ID}/commands"

# global commands are cached and only update every hour
# url = f"https://discord.com/api/v8/applications/{APP_ID}/commands"


class Type(Enum):
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


class Option:
    def __init__(self, name: str, desc: str, type: Type, required: bool = True):
        self.type = type.value
        self.name = name
        self.description = desc
        self.required = required


def make_command(
    name: str, desc: str, options: List[Option] = [], aliases: List[str] = []
):
    commands = [
        {
            "name": name,
            "description": desc,
            "options": [option.__dict__ for option in options],
        }
    ]

    for alias in aliases:
        t = commands[0].copy()
        t["name"] = alias
        commands.append(t)

    return commands


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
    make_command(
        "anime",
        "Search for an anime/manga",
        aliases=["manga"],
        options=[
            Option(
                "query",
                "The title for an anime/manga",
                type=Type.STRING,
            )
        ],
    )
    + make_command(
        "character",
        "Search for a character",
        options=[
            Option(
                "query",
                "The title of the character",
                type=Type.STRING,
            )
        ],
    )
    + make_command(
        "songs",
        "Search for the OP/ED and theme songs of an anime",
        aliases=["themes"],
        options=[
            Option(
                "query",
                "The title for an anime/manga",
                type=Type.STRING,
            )
        ],
    )
    + make_command(
        "next_episode",
        "Find when is the next episode for an anime",
        options=[
            Option(
                "title",
                "The title for an anime",
                type=Type.STRING,
            )
        ],
    )
    + make_command(
        "dice",
        "Roll a ten-sided dice",
        options=[
            Option(
                "amount",
                "The number of dices to roll",
                type=Type.INTEGER,
            )
        ],
    )
    + make_command(
        "gacha", "An experimental/ephemeral gacha command", aliases=["w", "pull"]
    )
    + make_command(
        "english",
        "Translate an anime/manga title to english",
        options=[
            Option(
                "title",
                "The title of an anime/manga name in romaji or native",
                type=Type.STRING,
            )
        ],
    )
    + make_command(
        "romaji",
        "Translate an anime/manga title to romaji",
        options=[
            Option(
                "title",
                "The title of an anime/manga name in english or native",
                type=Type.STRING,
            )
        ],
    )
    + make_command(
        "native",
        "Translate an anime/manga title to its native language",
        options=[
            Option(
                "title",
                "The title of an anime/manga name in english or romaji",
                type=Type.STRING,
            )
        ],
    )
)

print_commands()
