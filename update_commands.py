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
    def __init__(
        self,
        name: str,
        desc: str,
        type: Type,
        required: bool = True,
        # options: typing.List | None = None,
    ):
        # if options is not None:
        #     options = [option.__dict__ for option in options]
        # else:
        #     options = []

        self.name = name
        self.type = type.value
        self.name = name
        self.description = desc
        self.required = required
        # self.options = options


def make_command(
    name: str,
    desc: str | None = None,
    options: typing.List[Option] | None = None,
    aliases: typing.List[str] | None = None,
    canary_only: bool = False,
):
    if (canary_only) and (GUILD_ID is None):
        return []

    if canary_only:
        desc = f"{desc} (canary only)"

    commands = [
        {
            "name": name,
            "description": desc,
            "options": [option.__dict__ for option in options]
            if options is not None
            else [],
        }
    ]

    if aliases is not None:
        for alias in aliases:
            copy = commands[0].copy()
            copy["name"] = alias
            commands.append(copy)

    return commands


def load_manifest(filepath: str):
    with open(filepath + "/manifest.json", "r", encoding="utf-8") as file:
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
                    desc=f'{opt["description"]} ({manifest["title"]})',
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
        url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=commands, timeout=15000
    ).json()

    print(response)

    if "code" in response:
        sys.exit(1)


if __name__ == "__main__":
    set_commands(
        # standard gacha commands
        # uses characters and media from
        # all builtin, community, and manual repos
        make_command(
            name="anime",
            desc="Search for an anime/manga",
            options=[
                Option(
                    name="query",
                    desc="The title for an anime/manga",
                    type=Type.STRING,
                ),
                Option(
                    name="debug",
                    desc="Display the nerdy stuff",
                    type=Type.BOOLEAN,
                    required=False,
                ),
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
                Option(
                    name="debug",
                    desc="Display the nerdy stuff",
                    type=Type.BOOLEAN,
                    required=False,
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
        + make_command(
            name="force_pull",
            desc="Force a gacha pull",
            options=[
                Option(
                    name="id",
                    desc="The id of the character",
                    type=Type.STRING,
                )
            ],
            canary_only=True,
        )
        # repo management commands
        + make_command(
            name="repo",
            options=[
                Option(
                    name="builtin",
                    desc="Show all built-in enabled-by-default repositories",
                    type=Type.SUB_COMMAND,
                    required=False,
                )
            ],
            canary_only=True,
        )
        # non-standard (eternal) commands
        # non-gacha commands (specific one-task commands)
        + load_manifest("./repos/anilist")
        + load_manifest("./repos/utils")
    )
