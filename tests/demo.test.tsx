// deno-lint-ignore-file no-explicit-any

import React from 'https://esm.sh/react@18.2.0';

import { renderToString } from 'https://esm.sh/react-dom@18.2.0/server';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import { App, Embed, Gacha, Image, sleep } from '../src/demo.tsx';

import type { Pull } from '../src/gacha.ts';
import Rating from '../src/rating.ts';

Deno.test('<Embed/>', async (test) => {
  await assertSnapshot(
    test,
    renderToString(
      <Embed>
        <p>paragraph</p>
      </Embed>,
    ),
  );
});

Deno.test('<Image/>', async (test) => {
  await assertSnapshot(
    test,
    renderToString(
      <Image src={'src'} />,
    ),
  );
});

Deno.test('<Gacha/>', async (test) => {
  const pull = {
    rating: new Rating({ stars: 3 }),
    character: {
      name: {
        english: 'name',
      },
      images: [{
        url: 'url',
      }],
    },
    media: {
      title: {
        english: 'title',
      },
    },
  };

  await assertSnapshot(
    test,
    renderToString(
      <Gacha pull={pull as Pull} />,
    ),
  );
});

Deno.test('<App/>', async (test) => {
  await assertSnapshot(
    test,
    renderToString(
      <App>
        <p>paragraph</p>
      </App>,
    ),
  );
});

Deno.test('<App/> Suspended', async (test) => {
  const T = () => {
    return {
      read(): any {
        switch (false) {
          default:
            // deno-lint-ignore no-throw-literal
            throw '';
        }
      },
    };
  };

  const TT = () => <img src={T().read()} />;

  await assertSnapshot(
    test,
    renderToString(
      <App>
        <TT />
      </App>,
    ),
  );
});
