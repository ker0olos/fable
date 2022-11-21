const componentsIds = {
  nextPage: 'next-page-results',
  prevPage: 'prev-page-results',
};

export function hexToInt(hex?: string): number | undefined {
  if (!hex) {
    return undefined;
  }

  const color = hex.substring(1);

  const R = color.substring(0, 2);
  const G = color.substring(2, 4);
  const B = color.substring(4, 6);

  return parseInt(`${R}${G}${B}`, 16);
}

export function decodeDescription(s?: string): string | undefined {
  if (!s) {
    return undefined;
  }

  // s = s?.replaceAll('&amp;', '&');
  // s = s?.replaceAll('&quot;', '"');
  // s = s?.replaceAll('&#039;', '\'');
  // s = s?.replaceAll('&lt;', '<');
  // s = s?.replaceAll('&gt;', '>');

  // s = s?.replaceAll('<br>', '\n');

  s = s?.replaceAll(/~!.+!~/gm, '');

  return s;
}

export { componentsIds };
