import { describe, it, expect, beforeEach, vi } from 'vitest';

import help from '~/src/help.ts';

describe('/help', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('navigation', () => {
    const message = help.pages({ userId: 'user_id', index: 0 });

    expect(message.json().data.components[0].components[0]).toEqual({
      custom_id: 'help==8=prev',
      label: 'Prev',
      style: 2,
      type: 2,
    });

    expect(message.json().data.components[0].components[1]).toEqual({
      custom_id: '_',
      disabled: true,
      label: '1/9',
      style: 2,
      type: 2,
    });

    expect(message.json().data.components[0].components[2]).toEqual({
      custom_id: 'help==1=next',
      label: 'Next',
      style: 2,
      type: 2,
    });
  });

  it('pages', () => {
    for (let i = 0; i < 9; i++) {
      const message = help.pages({ userId: 'user_id', index: i });

      expect(message.json()).toMatchSnapshot();
    }
  });
});
