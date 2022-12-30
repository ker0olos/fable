import os
from enum import Enum
from typing import List

import requests

PROD = os.getenv("GITHUB_REF_NAME") == "main"

APP_ID = os.getenv("APP_ID" if PROD else "CANARY_ID")

BOT_TOKEN = os.getenv("BOT_TOKEN" if PROD else "CANARY_TOKEN")

GUILD_ID = os.getenv("GUILD_ID")

url = (
    f"https://discord.com/api/v8/applications/{APP_ID}/commands"
    if PROD
    else f"https://discord.com/api/v10/applications/{APP_ID}/guilds/{GUILD_ID}/commands"
)


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


# def print_commands():
#     response = requests.get(url, headers={"Authorization": f"Bot {BOT_TOKEN}"})
#     print(response.json())

# def delete_command(command_id):
#     response = requests.delete(
#         f"{url}/{command_id}", headers={"Authorization": f"Bot {BOT_TOKEN}"}
#     )
#     print(f'deleted command "{command_id}": {response.status_code}')


def set_commands(commands):
    if PROD:
        print("Updating global commands for production bot\n\n")
    else:
        print("Updating guild commands for canary bot\n\n")

    response = requests.put(
        url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=commands
    )
    print(response.json())


if __name__ == "__main__":
    set_commands(
        make_command(
            name="anime",
            desc="Search for an anime/manga",
            aliases=["manga"],
            options=[
                Option(
                    name="query",
                    desc="The title for an anime/manga",
                    type=Type.STRING,
                )
            ],
        )
        + make_command(
            name="character",
            desc="Search for a character",
            options=[
                Option(
                    name="query",
                    desc="The title of the character",
                    type=Type.STRING,
                )
            ],
        )
        + make_command(
            name="songs",
            desc="Search for the OP/ED and theme songs of an anime",
            aliases=["themes"],
            options=[
                Option(
                    name="query",
                    desc="The title for an anime/manga",
                    type=Type.STRING,
                )
            ],
        )
        + make_command(
            name="next_episode",
            desc="Find when is the next episode for an anime",
            options=[
                Option(
                    name="title",
                    desc="The title for an anime",
                    type=Type.STRING,
                )
            ],
        )
        + make_command(
            name="gacha",
            desc="An experimental/ephemeral gacha command",
            aliases=["w", "pull", "roll"],
        )
        + make_command(
            name="dice",
            desc="Roll a ten-sided dice",
            options=[
                Option(
                    name="amount",
                    desc="The number of dices to roll",
                    type=Type.INTEGER,
                )
            ],
        )
    )
