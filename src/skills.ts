import i18n from './i18n.ts';
import utils from './utils.ts';

import * as discord from './discord.ts';

import type * as Schema from '../db/schema.ts';

const skills: Record<string, Schema.CharacterSkill> = {
  'crit': {
    cost: 3,
    key: 'crit',
    descKey: 'crit-desc',
    activationTurn: 'enemy',
    activation: (_user, _enemy) => null,
    stats: [{
      key: 'crit-chance',
      scale: [0.5, 5, 15],
      suffix: '%',
    }, {
      key: 'crit-damage',
      scale: [30, 45, 60],
      suffix: '%',
    }],
  },
};

function all(
  index: number,
  locale?: discord.AvailableLocales,
): discord.Message {
  const message = new discord.Message();

  const pages = utils.chunks(Object.values(skills), 3);

  const page = pages[index];

  const content = page.map((skill) => {
    const stats = skill.stats.map((s, index) =>
      `${index + 1}. _${i18n.get(s.key, locale)} (${
        s.scale
          .map((t) => `${s.prefix ?? ''}${t}${s.suffix ?? ''}`)
          .join(', ')
      })_`
    );

    return [
      `**${i18n.get(skill.key, locale)}** (${skill.cost} ${
        i18n.get(
          skill.cost === 1 ? 'skill-point' : 'skill-points',
          locale,
        )
      })`,
      `${i18n.get(skill.descKey, locale)}`,
      `${stats.join('\n')}`,
    ].join('\n');
  }).join('\n\n');

  message.addEmbed(new discord.Embed().setDescription(content));

  return discord.Message.page({
    index,
    message,
    total: pages.length,
    type: 'skills',
    locale,
  });
}

export default {
  skills,
  all,
};
