import * as Schema from '~/db/schema.ts';

import type { Character, CharacterBattleStats } from './types.ts';

export class PartyMember {
  character: Character;
  #stats: CharacterBattleStats;
  #boost: Schema.CharacterStats;
  existing?: Schema.Character;
  owner: 'party1' | 'party2';

  constructor({ character, stats, existing, owner }: {
    character: Character;
    stats: CharacterBattleStats;
    existing?: Schema.Character;
    owner: 'party1' | 'party2';
  }) {
    this.character = character;
    this.#stats = stats;
    this.#boost = { attack: 0, defense: 0, speed: 0 };
    this.existing = existing;
    this.owner = owner;
  }

  public get alive(): boolean {
    return this.#stats.hp > 0;
  }

  public get hp(): number {
    return this.#stats.hp;
  }

  public get maxHP(): number {
    return this.#stats.maxHP;
  }

  public isHpBelow(percent: number): boolean {
    return this.#stats.hp <= this.#stats.maxHP * (percent / 100);
  }

  public get speed(): number {
    return this.#stats.speed + this.#boost.speed;
  }

  public get defense(): number {
    return this.#stats.defense + this.#boost.defense;
  }

  public get attack(): number {
    return this.#stats.attack;
  }

  public get skills(): CharacterBattleStats['skills'] {
    return this.#stats.skills;
  }

  public heal(heal: number): void {
    this.#stats.hp = Math.min(this.#stats.hp + heal, this.maxHP);
  }

  public damage(damage: number): void {
    this.#stats.hp = Math.max(this.#stats.hp - damage, 0);
  }

  public activateSpeedBoost(party: PartyMember[]): PartyMember {
    const boosts = party
      .map(({ skills }) => skills.speed)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const cur = this.#stats.speed;
    const boost = sorted[0]?.level ?? 0;

    this.#boost.speed = cur + (cur * boost);

    return this;
  }

  public activateDefenseBoost(party: PartyMember[]): PartyMember {
    const boosts = party
      .map(({ skills }) => skills.defense)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const cur = this.#stats.defense;
    const boost = sorted[0]?.level ?? 0;

    this.#boost.defense = cur + (cur * boost);

    return this;
  }
}

export const getBattleStats = (
  char: Schema.Character,
): CharacterBattleStats => {
  return {
    skills: char.combat?.skills ?? {},
    //
    attack: char.combat?.curStats?.attack || 1,
    speed: char.combat?.curStats?.speed || 1,
    defense: char.combat?.curStats?.defense || 1,
    //
    hp: char.combat?.curStats?.defense || 1,
    maxHP: char.combat?.curStats?.defense || 1,
  };
};
