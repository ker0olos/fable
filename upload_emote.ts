async function copyToClipboard(text: string): Promise<void> {
  const command = new Deno.Command(
    Deno.build.os === 'windows' ? 'clip' : 'xclip',
    {
      stdin: 'piped',
      args: Deno.build.os === 'windows' ? [] : ['-selection', 'clipboard'],
    },
  );

  const child = command.spawn();

  const writer = child.stdin.getWriter();

  writer.write(new TextEncoder().encode(text));

  await writer.close();
  // await child.stdin.close();
  await child.status;

  console.log('Copied to clipboard!');
}

async function uploadEmote(
  { BOT_TOKEN, GUILD_ID, emotePath, emoteName }: {
    BOT_TOKEN: string;
    GUILD_ID: string;
    emotePath: string;
    emoteName: string;
  },
): Promise<{ id: string }> {
  const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`;

  const imageData = await Deno.readFile(emotePath);

  const imageBase64 = btoa(String.fromCharCode(...imageData));

  const imageDataUrl = `data:image/png;base64,${imageBase64}`;

  const body = { image: imageDataUrl, name: emoteName };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const emoteData = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to upload emote: ${
        JSON.stringify(emoteData, null, 2) ?? response.statusText
      }`,
    );
  }

  return emoteData;
}

if (import.meta.main) {
  const GUILD_ID = '1046932492952805446';

  const BOT_TOKEN = Deno.env.get('BOT_TOKEN');

  const [emotePath, emoteName] = Deno.args;

  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined');
  }

  if (!emotePath) {
    throw new Error('Emote image path is not defined');
  }

  if (!emoteName) {
    throw new Error('Emote name is not defined');
  }

  const { id } = await uploadEmote({
    BOT_TOKEN,
    GUILD_ID,
    emoteName,
    emotePath,
  });

  const output = `<:${emoteName}:${id}>`;

  console.log(output);
  copyToClipboard('text-text');
}
