import { CharacterRole } from './types.ts';

import { emotes } from './config.ts';

export default class Rating {
  #stars: number;

  constructor(role: CharacterRole, popularity: number) {
    if (role === CharacterRole.BACKGROUND || popularity < 50_000) {
      this.#stars = 1;
    } //
    //
    else if (popularity < 200_000) {
      if (role === CharacterRole.MAIN) {
        this.#stars = 3;
      } else {
        this.#stars = 2;
      }
    } //
    //
    else if (popularity < 400_000) {
      if (role === CharacterRole.MAIN) {
        this.#stars = 4;
      } else {
        this.#stars = 3;
      }
    } //
    //
    else if (popularity > 400_000) {
      if (role === CharacterRole.MAIN) {
        this.#stars = 5;
      } else {
        this.#stars = 4;
      }
    } //
    //
    else {
      throw new Error(
        `Couldn't determine the star rating for { role: "${role}", popularity: ${popularity} }`,
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
}
