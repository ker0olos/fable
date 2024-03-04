import { skills } from '~/src/skills.ts';

import type * as Schema from '~/db/schema.ts';

import type { Character, CharacterBattleStats, StatusEffect } from './types.ts';

export class PartyMember {
  character: Character;
  #stats: CharacterBattleStats;
  #boost: Schema.CharacterStats;
  existing?: Schema.Character;
  owner: 'party1' | 'party2';
  effects: {
    enraged?: StatusEffect;
  };

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
    this.effects = {};
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

  public isHpBelowOrEquals(percent: number): boolean {
    return this.#stats.hp <= this.#stats.maxHP * (percent / 100);
  }

  public get attack(): number {
    return this.#stats.attack + this.#boost.attack;
  }

  public get defense(): number {
    return this.#stats.defense + this.#boost.defense;
  }

  public get speed(): number {
    return this.#stats.speed + this.#boost.speed;
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

  public activateAttackBoost(_party: PartyMember[]): PartyMember {
    this.#boost.attack = 0;

    return this;
  }

  public activateDefenseBoost(party: PartyMember[]): PartyMember {
    const boosts = party
      .map(({ skills }) => skills.defense)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const cur = this.#stats.defense;
    const boost = (sorted[0]?.level ?? 0) / 100;

    this.#boost.defense = cur * boost;

    return this;
  }

  public activateSpeedBoost(party: PartyMember[]): PartyMember {
    const boosts = party
      .map(({ skills }) => skills.speed)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const cur = this.#stats.speed;
    const boost = (sorted[0]?.level ?? 0) / 100;

    this.#boost.speed = cur * boost;

    return this;
  }

  public activateEnrageBoost(): PartyMember {
    const lvl = this.skills.enrage?.level ?? 0;

    if (lvl > 0) {
      const [_remainingHP, _boost] = skills.enrage.stats;

      const remainingHP = _remainingHP.scale[lvl - 1];
      const boost = _boost.scale[lvl - 1] / 100;

      if (this.isHpBelowOrEquals(remainingHP)) {
        this.#boost.attack += this.#stats.attack * boost;
        this.#boost.defense += this.#stats.defense * boost;
        this.#boost.speed += this.#stats.speed * boost;
        this.effects.enraged = { active: true };
      }
    }

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
