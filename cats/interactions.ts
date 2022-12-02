import { json, serve, validateRequest, verifySignature } from '../net.ts';

import { random } from '../utils.ts';

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

  const {
    type = 0,
    // token = '',
    data = { options: [] },
    member = { user: { id: '' } },
  } = JSON.parse(body);

  if (type === 1) {
    return discord.Message.pong();
  }

  // console.log(type, data, token, member);

  try {
    if (type === 2) {
      //
      // SLASH COMMANDS
      //

      switch (data.name) {
        case 'roll': {
          const rolledNumber = roll({ amount: data.options[0].value });

          const message: discord.Message = new discord.Message(
            discord.MESSAGE_TYPE.NEW,
          ).setContent(`<@${member.user.id}> ${rolledNumber}`);

          return message.json();
        }
        default:
          break;
      }
    }
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return discord.Message.error('Found nothing matching that name!');
    }
    return discord.Message.error(err);
  }

  return discord.Message.error('bad request');
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
