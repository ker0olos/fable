import { spy } from 'https://deno.land/std@0.179.0/testing/mock.ts';

export const FakeClient = () => ({
  query: spy(),
});
