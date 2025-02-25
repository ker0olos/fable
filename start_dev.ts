const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

async function tunnel() {
  try {
    const maxAttempts = 5;

    let ngrok;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        ngrok = await fetch('http://localhost:4040/api/tunnels');

        const { tunnels } = await ngrok.json();

        console.log(green(tunnels[0].public_url));

        break;
      } catch {
        attempts++;
        await sleep(1000);
      }
    }

    if (attempts >= maxAttempts) {
      console.error('Failed to fetch ngrok tunnels after multiple attempts.');
    }
  } catch (err) {
    console.error(err);
  }
}

tunnel();
