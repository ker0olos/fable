import { json, serve, validateRequest, verifySignature } from '../net.ts';

import * as discord from '../discord.ts';

const APP_PUBLIC_KEY =
  'e1d358df7edf4d74bead5b91d82fa58a596b2d4054264824c49fad6e9c520361';

async function handler(request: Request): Promise<Response> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return json(
      { error: error.message },
      { status: error.status },
    );
  }

  const { valid, body } = await verifySignature(
    request,
    APP_PUBLIC_KEY,
  );

  if (!valid) {
    return json(
      { error: 'Invalid request' },
      { status: 401 },
    );
  }

  const { name, type, member, options } = new discord.Interaction<number>(body);

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  console.log(name, type, options);

  try {
    if (type === discord.InteractionType.SlashCommand) {
      switch (name) {
        case 'roll': {
          const rolledNumber = roll({ amount: options!['amount'].value });

          const message = new discord.Message().setContent(
            `<@${member!.user.id}> ${rolledNumber}`,
          );

          return message.json();
        }
        default:
          break;
      }
    }
  } catch (err) {
    return discord.Message.error(err);
  }

  return discord.Message.error('Unimplemented');
}

function random(min: number, max: number) {
  return Math.floor((Math.random()) * (max - min + 1)) + min;
}

function roll({ amount }: { amount: number }) {
  const rolls = [];

  const dieSize = 10;
  const minSuccess = 8;

  let successes = 0;

  for (let i = 0; i < amount; i++) {
    const roll = random(1, dieSize);

    successes += roll >= minSuccess ? 1 : 0;

    rolls.push(roll >= minSuccess ? `__${roll}__` : `${roll}`);
  }

  const plural = successes === 1 ? 'Success' : 'Successes';

  const equation = rolls.join(' + ');

  return `\`${amount}d${dieSize}>=${minSuccess}\` \n = [ ${equation} ] \n = **${successes}** ${plural}`;
}

serve(handler);
