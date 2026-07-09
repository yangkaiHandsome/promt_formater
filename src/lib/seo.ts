import { SITE } from '../config';

export function canonicalUrl(path = '/', domain = SITE.domain) {
  const url = new URL(path || '/', domain);

  if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}
