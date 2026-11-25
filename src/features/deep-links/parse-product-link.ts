const PRODUCT_PATH = /(?:^|\/)product\/(\d+)\/?(?:[?#].*)?$/;

export function parseProductLink(path: string): number | null {
  const match = PRODUCT_PATH.exec(path.replace(/^[a-z][\w+.-]*:\/\//i, '/'));
  if (!match?.[1]) return null;

  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
