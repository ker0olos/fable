import os
import sys
import json
import typing
from enum import Enum

import requests

APP_ID = os.getenv("APP_ID")

BOT_TOKEN = os.getenv("BOT_TOKEN")

GUILD_ID = os.getenv("GUILD_ID")

url = (
    f"https://discord.com/api/v10/applications/{APP_ID}/commands"
    if GUILD_ID is None
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
    name: str,
    desc: str,
    options: typing.List[Option] = [],
    aliases: typing.List[str] = [],
    canary_only: bool = False,
):
    if (canary_only) and (GUILD_ID is None):
        return []

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


def load_manifest(filepath: str):
    with open(filepath + "/manifest.json", "r") as file:
        data = file.read()

    manifest = json.loads(data)

    commands = []

    for name in manifest["commands"]:
        desc = manifest["commands"][name]["description"]
        options = manifest["commands"][name]["options"]

        commands += make_command(
            name,
            desc,
            [
                Option(
                    name=opt["id"],
                    desc=opt["description"],
                    type=Type[opt["type"].upper()],
                )
                for opt in options
            ],
        )

    return commands


def set_commands(commands):
    print(os.getenv("GITHUB_REF_NAME"))

    if GUILD_ID is None:
        print("Updating global commands for production bot\n\n")
    else:
        print("Updating guild commands for canary bot\n\n")

    response = requests.put(
        url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=commands
    ).json()

    print(response)

    if "code" in response:
        sys.exit(1)


if __name__ == "__main__":
    set_commands(
        make_command(
            name="anime",
            desc="Search for an anime/manga",
            options=[
                Option(
                    name="query",
                    desc="The title for an anime/manga",
                    type=Type.STRING,
                )
            ],
            aliases=["manga"],
        )
        + make_command(
            name="character",
            desc="Search for a character",
            options=[
                Option(
                    name="query",
                    desc="The title of the character",
                    type=Type.STRING,
                ),
            ],
            aliases=["debug"],
        )
        + make_command(
            name="songs",
            desc="Search for the OP/ED and theme songs of an anime",
            options=[
                Option(
                    name="query",
                    desc="The title for an anime/manga",
                    type=Type.STRING,
                )
            ],
            aliases=["themes"],
        )
        + make_command(
            name="gacha",
            desc="An experimental/ephemeral gacha command",
            aliases=["w", "pull", "roll"],
            canary_only=True,
        )
        + load_manifest("./repos/anilist")
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
