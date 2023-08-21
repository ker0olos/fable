if (import.meta.main) {
  const APP_ID = Deno.env.get('APP_ID');

  const TOPGG_TOKEN = Deno.env.get('TOPGG_TOKEN');

  if (!APP_ID) {
    throw new Error('APP_ID is not defined');
  }

  if (!TOPGG_TOKEN) {
    throw new Error('TOPGG_TOKEN is not defined');
  }

  // deno-lint-ignore camelcase
  const { server_count }: { server_count: number } =
    await (await fetch('https://fable.deno.dev/stats')).json();

  console.log(`APP ID: ${APP_ID}`);
  console.log(`Server Count: ${server_count}`);

  const response = await fetch(
    `https://top.gg/api/bots/${APP_ID}/stats`,
    {
      method: 'POST',
      headers: {
        'Authorization': TOPGG_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server_count,
      }),
    },
  );

  console.log(
    response.status,
    response.statusText,
    await response.text(),
  );

  if (!response.ok) {
    Deno.exit(1);
  }
}
