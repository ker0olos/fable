import utils from '~/src/utils.ts';

import { emotes } from '~/src/discord.ts';

import { CHARACTER_ROLE } from '@prisma/client';

export default class Rating {
  #stars = 0;

  constructor({
    role,
    popularity,
    stars,
  }: {
    stars?: number;
    role?: CHARACTER_ROLE;
    popularity?: number;
  }) {
    if (typeof stars === 'number') {
      this.#stars = stars;
      return;
    }

    if (
      role === CHARACTER_ROLE.BACKGROUND ||
      !popularity ||
      popularity < 50_000
    ) {
      this.#stars = 1;
    } else if (popularity < 200_000) {
      if (role === CHARACTER_ROLE.MAIN) {
        this.#stars = 3;
      } else {
        this.#stars = 2;
      }
    } else if (popularity < 400_000) {
      if (role === CHARACTER_ROLE.MAIN) {
        this.#stars = 4;
      } else {
        this.#stars = 3;
      }
    } else if (popularity >= 400_000) {
      if (role === CHARACTER_ROLE.MAIN) {
        this.#stars = 5;
      } else if (!role && popularity >= 1_000_000) {
        this.#stars = 5;
      } else {
        this.#stars = 4;
      }
    } else {
      utils.captureException(
        new Error(
          `Couldn't determine the star rating for { role: "${role}", popularity: ${popularity} }`
        )
      );
    }
  }

  get stars(): number {
    return this.#stars;
  }

  get emotes(): string {
    return `${emotes.star.repeat(this.#stars)}${emotes.noStar.repeat(
      5 - this.#stars
    )}`;
  }
}
