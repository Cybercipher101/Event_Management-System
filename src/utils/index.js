export function createPageUrl(page, params = {}) {
  // Returns a basic URL. Improve logic as needed.
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `/pages/${page}${query ? '?' + query : ''}`;
}
