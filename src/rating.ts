import utils from '~/src/utils.ts';

import { emotes } from '~/src/discord.ts';

import { Character, CharacterRole } from '~/src/types.ts';

import { AniListCharacter } from '~/packs/anilist/types.ts';

export default class Rating {
  #stars = 0;

  constructor(
    { role, popularity, stars }: {
      stars?: number;
      role?: CharacterRole;
      popularity?: number;
    },
  ) {
    if (typeof stars === 'number') {
      this.#stars = stars;
      return;
    }

    if (
      role === CharacterRole.Background ||
      !popularity || popularity < 50_000
    ) {
      this.#stars = 1;
    } else if (popularity < 200_000) {
      if (role === CharacterRole.Main) {
        this.#stars = 3;
      } else {
        this.#stars = 2;
      }
    } else if (popularity < 400_000) {
      if (role === CharacterRole.Main) {
        this.#stars = 4;
      } else {
        this.#stars = 3;
      }
    } else if (popularity >= 400_000) {
      if (role === CharacterRole.Main) {
        this.#stars = 5;
      } else if (!role && popularity >= 1_000_000) {
        this.#stars = 5;
      } else {
        this.#stars = 4;
      }
    } else {
      utils.captureException(
        new Error(
          `Couldn't determine the star rating for { role: "${role}", popularity: ${popularity} }`,
        ),
      );
    }
  }

  get stars(): number {
    return this.#stars;
  }

  get emotes(): string {
    return `${emotes.star.repeat(this.#stars)}${
      emotes.noStar.repeat(5 - this.#stars)
    }`;
  }

  static fromCharacter(character: Character | AniListCharacter): Rating {
    if (character.popularity) {
      return new Rating({ popularity: character.popularity });
    }

    if (character.media?.edges?.length) {
      const edge = character.media.edges[0];

      return new Rating({
        popularity: edge.node.popularity,
        role: 'characterRole' in edge ? edge.characterRole : edge.role,
      });
    }

    return new Rating({ popularity: 0 });
  }
}
