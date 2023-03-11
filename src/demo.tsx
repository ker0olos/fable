import React, { Suspense } from 'https://esm.sh/react@18.2.0';

import { renderToReadableStream } from 'https://esm.sh/react-dom@18.2.0/server';

import gacha, { Pull } from './gacha.ts';

import packs from './packs.ts';

import utils from './utils.ts';

let origin = '';

const guildId = '0';

const colors = {
  border: '#1e1f22',
  foreground: '#e0e1e5',
  background: '#313338',
  embed: '#2b2d31',
};

const emotes = {
  star:
    'https://cdn.discordapp.com/emojis/1061016362832642098.webp?size=44&quality=lossless',
  noStar:
    'https://cdn.discordapp.com/emojis/1061016360190222466.webp?size=44&quality=lossless',
};

const rngPullSuspense = () => {
  let result: Pull | Error;

  let status: 'pending' | 'error' | 'success' = 'pending';

  // sleep before each request to act as a primitive rate-limiter
  const suspender = utils.sleep(utils.randint(1.25, 3))
    .then(() => gacha.rngPull({ guildId }))
    .then(
      (pull) => {
        status = 'success';
        result = pull;
      },
    )
    .catch((error) => {
      status = 'error';
      result = (console.error(error), error);
    });

  return {
    read(): Pull {
      switch (status) {
        case 'pending':
          throw suspender;
        case 'error':
          throw result;
        case 'success':
          return result as Pull;
      }
    },
  };
};

export const Embed = ({ children }: React.PropsWithChildren) => {
  return (
    <div
      style={{
        overflow: 'hidden',

        backgroundColor: colors.embed,

        padding: '.5rem 1rem 1rem .75rem',
        borderLeft: `4px solid ${colors.border}`,
        borderRadius: '4px',

        lineHeight: '22px',
      }}
    >
      {children}
    </div>
  );
};

export const Image = ({ src }: { src: string }) => {
  return (
    <img
      style={{
        width: 'auto',
        minWidth: '213px',
        minHeight: '300px',
        maxHeight: '300px',
        borderRadius: '4px',
        marginTop: '16px',
      }}
      src={src}
    />
  );
};

export const Gacha = ({ pull }: { pull: Pull }) => {
  return (
    <>
      <div style={{ display: 'flex', marginTop: '8px' }}>
        {Array(pull.rating.stars).fill({}).map(() => (
          <img
            style={{ width: '18px', height: '18px' }}
            src={emotes.star}
          />
        ))}
        {Array(5 - pull.rating.stars).fill({}).map(() => (
          <img
            style={{ width: '18px', height: '18px' }}
            src={emotes.noStar}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: '8px',
          marginBottom: '2px',
          lineHeight: '1.125rem',
          color: colors.foreground,
          fontSize: '0.875rem',
          fontFamily: `'Noto Sans', sans-serif`,
          fontWeight: '600',
        }}
      >
        {`${utils.wrap(packs.aliasToArray(pull.media.title)[0])}`}
      </div>

      <div
        style={{
          whiteSpace: 'pre-line',
          lineHeight: '1.125rem',
          color: colors.foreground,
          fontSize: '0.875rem',
          fontFamily: `'Noto Sans', sans-serif`,
          fontWeight: 700,
        }}
      >
        {`${utils.wrap(packs.aliasToArray(pull.character.name)[0])}`}
      </div>

      <Image
        src={`${origin}/external/${
          encodeURIComponent(pull.character.images?.[0].url ?? '')
        }`}
      />
    </>
  );
};

export const App = ({ children }: React.PropsWithChildren) => {
  return (
    <html>
      <head>
        <title>Fable</title>
        <link
          rel='icon'
          type='image/x-icon'
          href='https://raw.githubusercontent.com/ker0olos/fable/main/assets/icon.png'
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          crossOrigin='anonymous'
          href='https://fonts.gstatic.com'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Noto+Sans:wght@600;700&display=swap'
          rel='stylesheet'
        />
      </head>
      <body
        style={{
          display: 'flex',
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: 0,
          margin: 0,
        }}
      >
        <Embed>
          <Suspense fallback={<Image src={`${origin}/assets/spinner.gif`} />}>
            {children}
          </Suspense>
        </Embed>
      </body>
    </html>
  );
};

export default async (r: Request): Promise<Response> => {
  const pull = rngPullSuspense();

  const GachaSuspend = () => <Gacha pull={pull.read()} />;

  origin = new URL(r.url).origin;

  return new Response(
    await renderToReadableStream(
      <App>
        <GachaSuspend />
      </App>,
    ),
    { headers: { 'Content-Type': 'text/html' } },
  );
};
