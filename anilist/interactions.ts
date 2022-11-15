import { serve } from 'https://deno.land/std@0.130.0/http/server.ts';

import { json, validateRequest, verifySignature } from '../index.ts';

async function handler(request: Request): Promise<Response> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { valid, body } = await verifySignature(
    request,
    Deno.env.get('DISCORD_PUBLIC_KEY')!,
  );

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

  if (type === 2 && data.name === 'ping') {
    return json({
      type: 4,
      data: {
        content: `pong`,
      },
    });
  }

  return json({ error: 'bad request' }, { status: 400 });
}

serve(handler);
