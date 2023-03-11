// deno-lint-ignore-file no-explicit-any

import React from 'https://esm.sh/react@18.2.0';

import { renderToString } from 'https://esm.sh/react-dom@18.2.0/server';

import { FakeTime } from 'https://deno.land/std@0.179.0/testing/time.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import {
  App,
  Desc,
  Embed,
  Gacha,
  Image,
  Media,
  Rating as RatingElement,
  Title,
} from '../src/demo.tsx';

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

Deno.test('<Title/>', async (test) => {
  await assertSnapshot(
    test,
    renderToString(
      <Title text={'title'} />,
    ),
  );
});

Deno.test('<Desc/>', async (test) => {
  await assertSnapshot(
    test,
    renderToString(
      <Desc text={'description'} />,
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

Deno.test('<Media/>', async (test) => {
  const pull = {
    media: {
      title: {
        english: 'title',
      },
      images: [{
        url: 'url',
      }],
    },
  };

  const timeStub = new FakeTime();

  try {
    await assertSnapshot(
      test,
      renderToString(
        <Media pull={pull as any} />,
      ),
    );

    await timeStub.tickAsync(4000);
  } finally {
    timeStub.restore();
  }
});

Deno.test('<Rating/>', async (test) => {
  const pull = {
    rating: new Rating({ stars: 3 }),
  };

  const timeStub = new FakeTime();

  try {
    await assertSnapshot(
      test,
      renderToString(
        <RatingElement pull={pull as any} />,
      ),
    );

    await timeStub.tickAsync(5000);
  } finally {
    timeStub.restore();
  }
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
