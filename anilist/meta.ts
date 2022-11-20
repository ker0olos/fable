const NEW_MESSAGE = 4;
const UPDATE_MESSAGE = 7;

const componentTypes = {
  GROUP: 1,
  BUTTON: 2,
};

const colors = {
  blue: 1,
  grey: 2,
  green: 3,
  red: 4,
};

const componentsIds = {
  nextPage: 'next-page-results',
  prevPage: 'prev-page-results',
};

export function hexToInt(hex?: string): number | null {
  if (!hex) {
    return null;
  }

  const color = hex.substring(1);

  const R = color.substring(2, 2);
  const G = color.substring(4, 2);
  const B = color.substring(6, 2);

  return parseInt(`${R}${G}${B}`, 16);
}

export { colors, componentsIds, componentTypes, NEW_MESSAGE, UPDATE_MESSAGE };
