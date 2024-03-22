import { search } from 'orama';

import { loadCharactersIndex } from '~/search-index/mod.ts';

const index = await loadCharactersIndex(true);

// console.time('search');
const _t = await search(index, {
  term: 'luka',
});
// console.timeEnd('search');

// console.log(_t);
