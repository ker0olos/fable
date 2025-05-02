import { emotes } from '~/src/discord.ts';

export default class Rating {
  #stars = 0;

  constructor({ stars }: { stars?: number }) {
    if (typeof stars === 'number') {
      this.#stars = stars;
      return;
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
