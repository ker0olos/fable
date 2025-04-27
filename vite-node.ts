import { createServer } from 'vite';
import { resolve } from 'path';

async function runScript(scriptPath: string) {
  const absolutePath = resolve(scriptPath);

  const server = await createServer({
    configFile: './vite.config.js',
    server: { middlewareMode: true },
  });

  try {
    const module = await server.ssrLoadModule(absolutePath);
    if (typeof module.main === 'function') {
      await module.main();
    } else {
      console.error('No main function exported from', scriptPath);
    }
  } finally {
    await server.close();
  }
}

const scriptPath = process.argv[2];

runScript(scriptPath).catch((error) => {
  console.error('Error running script:', error);
  process.exit(1);
});
