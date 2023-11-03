import { assertEquals } from '$std/assert/mod.ts';

import skills from '../src/skills.ts';

Deno.test('/skills showall', async (test) => {
  await test.step('page 0', () => {
    const message = skills.all(0);

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        embeds: [{
          type: 'rich',
          description: [
            `**Critical Hits** (3 Skill Points)`,
            `The art of performing traditional critical hits`,
            `1. _Crit Chance (0.5%, 5%, 15%)_`,
            `2. _Crit Damage (30%, 45%, 60%)_`,
          ].join('\n'),
        }],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'skills==0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '1/1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'skills==0=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      },
    });
  });
});
