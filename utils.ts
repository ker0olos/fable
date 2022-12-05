export function hexToInt(hex?: string): number | undefined {
  if (!hex) {
    return;
  }

  const color = hex.substring(1);

  const R = color.substring(0, 2);
  const G = color.substring(2, 4);
  const B = color.substring(4, 6);

  return parseInt(`${R}${G}${B}`, 16);
}

export function shuffle<T>(array: T[]) {
  for (
    let i = 0, length = array.length, swap = 0, temp = null;
    i < length;
    i++
  ) {
    swap = Math.floor(Math.random() * (i + 1));
    temp = array[swap];
    array[swap] = array[i];
    array[i] = temp;
  }

  return array;
}

export function capitalize(s: string): string {
  const sa = s.split('_');
  return sa.map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase()).join(' ')
    .trim();
}

export function decodeDescription(s?: string): string | undefined {
  if (!s) {
    return;
  }

  s = decodeURI(s);

  s = s.replaceAll('&amp;', '&');
  s = s.replaceAll('&quot;', '"');
  s = s.replaceAll('&#039;', '\'');
  s = s.replaceAll('&lt;', '<');
  s = s.replaceAll('&gt;', '>');

  s = s.replaceAll(/~!.+!~/gm, '');

  s = s.replace(/<i.*?>((.|\n)*?)<\/i>/g, '*$1*');
  s = s.replace(/<b.*?>((.|\n)*?)<\/b>/g, '**$1**');
  s = s.replace(/<strike.*?>((.|\n)*?)<\/strike>/g, '~~$1~~');

  s = s.replaceAll(/<br>|<\/br>|<br\/>|<hr>|<\/hr>/gm, '\n');

  s = s.replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)');

  return s;
}
