import fs from 'node:fs';

import * as Sentry from '@sentry/deno';

import * as communityAPI from '~/src/communityAPI.ts';

import { handler } from '~/src/interactions.ts';

import config, { initConfig } from '~/src/config.ts';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
Deno.serve(async (request: Request) => {
  await initConfig();

  Sentry.init({ dsn: config.sentry, sendDefaultPii: true });

  const url = new URL(request.url);

  if (url.pathname === '/') {
    return handler(request);
  }

  if (url.pathname === '/api/user') {
    return communityAPI.user(request);
  }

  if (url.pathname === '/api/publish') {
    return communityAPI.publish(request);
  }

  if (url.pathname === '/api/popular') {
    return communityAPI.popular(request);
  }

  if (url.pathname === '/api/updated') {
    return communityAPI.lastUpdated(request);
  }

  if (url.pathname.startsWith('/api/pack/')) {
    const packId = url.pathname.substring('/api/pack/'.length);
    return communityAPI.pack(request, packId);
  }

  if (url.pathname === '/api/search') {
    return communityAPI.search(request);
  }

  if (url.pathname === '/invite') {
    return Response.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${config.appId}&scope=applications.commands%20bot`
    );
  }

  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', {
      headers: { 'content-type': 'text/plain' },
    });
  }

  if (url.pathname.startsWith('/')) {
    try {
      const filename = url.pathname.substring('/'.length);
      const file = await fs.promises.readFile(`./assets/public/${filename}`);
      const contentType = filename.endsWith('.gif')
        ? 'image/gif'
        : filename.endsWith('.webp')
          ? 'image/webp'
          : 'text/plain';
      return new Response(file, {
        headers: {
          'content-type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (e) {
      console.error(e);
      return new Response('Not Found', { status: 404 });
    }
  }

  return new Response('Not Found', { status: 404 });
});
