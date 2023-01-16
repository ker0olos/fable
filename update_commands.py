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


class Permission(Enum):
    OWNER = 0
    ADMINISTRATORS = str(1 << 3)
    MANAGE_GUILD = str(1 << 5)
    ALL = None


class Option:
    def __init__(
        self,
        name: str,
        desc: str,
        type: Type,
        required: bool = True
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
    default_permission: Permission = Permission.ALL,
    dev_only: bool = False,
):
    if dev_only and (GUILD_ID is None):
        return []

    if dev_only:
        desc = f"{desc} (Developer)"

    commands = [
        {
            "name": name,
            "description": desc,
            "default_member_permissions": default_permission.value,
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
        desc = f'{manifest["commands"][name]["description"]} ({manifest["title"]})'
        options = manifest["commands"][name]["options"]

        commands += make_command(
            name,
            desc,
            [
                Option(
                    name=opt["id"],
                    desc=opt["description"],
                    type=Type[opt["type"].upper()],
                    required=opt["required"] if "required" in opt else True,
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
        print("Updating guild commands for dev bot\n\n")

    response = requests.put(
        url, headers={"Authorization": f"Bot {BOT_TOKEN}"}, json=commands, timeout=15000
    ).json()

    print(response)

    if "code" in response:
        sys.exit(1)


if __name__ == "__main__":
    set_commands(
        # standard gacha commands
        # uses characters and media from all packs
        make_command(
            name="search",
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
            aliases=["anime", "manga"],
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
            name="themes",
            desc="Search for the OP/ED and theme songs of an anime",
            options=[
                Option(
                    name="query",
                    desc="The title for an anime/manga",
                    type=Type.STRING,
                )
            ],
            aliases=["songs", "music"],
        )
        + make_command(
            name="gacha",
            desc="An experimental/ephemeral gacha command",
            aliases=["w", "pull", "roll"],
            dev_only=True,
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
            default_permission=Permission.ADMINISTRATORS,
            dev_only=True,
        )
        # pack management commands
        + make_command(
            name="packs",
            desc="Pack management commands",
            options=[
                Option(
                    name="builtin",
                    desc="List all the builtin packs",
                    type=Type.SUB_COMMAND,
                    required=False,
                ),
                Option(
                    name="manual",
                    desc="List all the manually instated packs",
                    type=Type.SUB_COMMAND,
                    required=False,
                ),
            ],
            default_permission=Permission.MANAGE_GUILD,
        )
        # non-standard commands (pack commands)
        + load_manifest("./packs/anilist")
        + load_manifest("./packs/x")
    )
