import { randint } from './utils.ts';

import * as discord from './discord.ts';

export function diceRoll(
  { user, amount }: { user: discord.User; amount: number },
) {
  const rolls = [];

  const dieSize = 10;
  const minSuccess = 8;

  let successes = 0;

  for (let i = 0; i < amount; i++) {
    const roll = randint(1, dieSize);

    successes += roll >= minSuccess ? 1 : 0;

    rolls.push(roll >= minSuccess ? `__${roll}__` : `${roll}`);
  }

  const plural = successes === 1 ? 'Success' : 'Successes';

  const equation = rolls.join(' + ');

  const rolledNumber =
    `\`${amount}d${dieSize}>=${minSuccess}\` \n = [ ${equation} ] \n = **${successes}** ${plural}`;

  const message = new discord.Message().setContent(
    `<@${user.id}> ${rolledNumber}`,
  );

  return message;
}
