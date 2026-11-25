export type DeepLink =
  | { kind: 'passthrough' }
  | { kind: 'product'; id: number }
  | { kind: 'invalid-product' }
  | { kind: 'unknown' };

const APP_ROUTES = new Set(['', 'login']);

export function parseProductId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function parseDeepLink(path: string): DeepLink {
  const route = path
    .replace(/^[a-z][\w+.-]*:\/\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '');
  const [head = '', ...rest] = route.split('/');

  if (head === 'expo-development-client') return { kind: 'passthrough' };
  if (APP_ROUTES.has(head) && rest.length === 0) return { kind: 'passthrough' };

  if (head === 'product') {
    const id = rest.length === 1 ? parseProductId(rest[0]) : null;
    return id === null ? { kind: 'invalid-product' } : { kind: 'product', id };
  }

  return { kind: 'unknown' };
}
