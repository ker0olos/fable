import {
  json,
  serve,
  validateRequest,
} from 'https://deno.land/x/sift@0.5.0/mod.ts';

import nacl from 'https://cdn.skypack.dev/tweetnacl@v1.0.3?dts';

serve({
  '/': async (request: Request) => {
    const { error } = await validateRequest(request, {
      POST: {
        headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
      },
    });

    if (error) {
      return json({ error: error.message }, { status: error.status });
    }

    const { valid, body } = await verifySignature(request);

    if (!valid) {
      return json(
        { error: 'Invalid request' },
        {
          status: 401,
        },
      );
    }

    const {
      type = 0,
      token = '',
      data = { options: [] },
      member = { user: { id: '' } },
    } = JSON.parse(body);

    if (type === 1) {
      return json({
        type: 1,
      });
    }

    console.log(type, data, token, member);

    if (type === 2 && data.name === 'roll') {
      const rolledNumber = roll({ amount: data.options[0].value });

      return json({
        type: 4,
        data: {
          content: `<@${member.user.id}> ${rolledNumber}`,
        },
      });
    }

    return json({ error: 'bad request' }, { status: 400 });
  },
});

async function verifySignature(
  request: Request,
): Promise<{ valid: boolean; body: string }> {
  const PUBLIC_KEY = Deno.env.get('DISCORD_PUBLIC_KEY')!;

  const signature = request.headers.get('X-Signature-Ed25519')!;
  const timestamp = request.headers.get('X-Signature-Timestamp')!;

  const body = await request.text();

  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(PUBLIC_KEY),
  );

  return { valid, body };
}

function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
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

function random(min: number, max: number) {
  return Math.floor((Math.random()) * (max - min + 1)) + min;
}
