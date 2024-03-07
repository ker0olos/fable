import { skills } from '~/src/skills.ts';

import type * as Schema from '~/db/schema.ts';

import type { Character, CharacterBattleStats, StatusEffect } from './types.ts';

export class PartyMember {
  character: Character;
  #stats: CharacterBattleStats;
  #boost: Schema.CharacterStats;
  #debuff: Schema.CharacterStats;
  existing?: Schema.Character;
  owner: 'party1' | 'party2';
  effects: {
    enraged?: StatusEffect;
    stunned?: StatusEffect;
    slowed?: StatusEffect;
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
    this.#debuff = { attack: 0, defense: 0, speed: 0 };
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
    const boost = this.#stats.attack * this.#boost.attack;
    const debuff = this.#stats.attack * this.#debuff.attack;
    return this.#stats.attack + boost - debuff;
  }

  public get defense(): number {
    const boost = this.#stats.defense * this.#boost.defense;
    const debuff = this.#stats.defense * this.#debuff.defense;
    return this.#stats.defense + boost - debuff;
  }

  public get speed(): number {
    const boost = this.#stats.speed * this.#boost.speed;
    const debuff = this.#stats.speed * this.#debuff.speed;
    return this.#stats.speed + boost - debuff;
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

  // public activateAttackBoost(_party: PartyMember[]): PartyMember {
  //   this.#boost.attack = 0;

  //   return this;
  // }

  public activateDefenseBoost(party: PartyMember[]): PartyMember {
    const boosts = party
      .map(({ skills }) => skills.defense)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const percent = (sorted[0]?.level ?? 0) / 100;

    this.#boost.defense = percent;

    return this;
  }

  public activateSpeedBoost(party: PartyMember[]): PartyMember {
    const boosts = party
      .map(({ skills }) => skills.speed)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const percent = (sorted[0]?.level ?? 0) / 100;

    this.#boost.speed = percent;

    return this;
  }

  public activateSlowDebuff(enemyParty: PartyMember[]): PartyMember {
    const boosts = enemyParty
      .map(({ skills }) => skills.slow)
      .filter(Boolean) as Schema.AcquiredCharacterSkill[];

    const sorted = boosts.sort((a, b) => b.level - a.level);

    const percent = (sorted[0]?.level ?? 0) / 100;

    this.#debuff.speed = percent;

    this.effects.slowed = percent > 0 ? { active: true } : undefined;

    return this;
  }

  public activateEnrageBoost(): PartyMember {
    const lvl = this.skills.enrage?.level ?? 0;

    if (lvl > 0) {
      const [_remainingHP, _boost] = skills.enrage.stats;

      const remainingHP = _remainingHP.scale[lvl - 1];

      const boost = _boost.scale[lvl - 1] / 100;

      if (this.isHpBelowOrEquals(remainingHP)) {
        this.#boost.attack += boost;
        this.#boost.defense += boost;
        this.#boost.speed += boost;

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
