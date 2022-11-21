import { serve } from 'https://deno.land/std@0.130.0/http/server.ts';

import { json, validateRequest, verifySignature } from '../index.ts';

import { random } from '../utils.ts';

import * as discord from '../discord.ts';

const DISCORD_PUBLIC_KEY = Deno.env.get('DISCORD_PUBLIC_KEY')!;

async function handler(request: Request): Promise<Response> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return json(JSON.stringify({ error: error.message }), {
      status: error.status,
    });
  }

  const { valid, body } = await verifySignature(
    request,
    DISCORD_PUBLIC_KEY,
  );

  if (!valid) {
    return json(
      JSON.stringify({ error: 'Invalid request' }),
      {
        status: 401,
      },
    );
  }

  const {
    type = 0,
    // token = '',
    data = { options: [] },
    member = { user: { id: '' } },
  } = JSON.parse(body);

  if (type === 1) {
    return json(discord.Message.ping());
  }

  // console.log(type, data, token, member);

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

        return json(message.done());
      }
      default:
        break;
    }
  }

  return json(JSON.stringify({ error: 'bad request' }), { status: 400 });
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
