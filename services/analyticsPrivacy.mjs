// Page analytics need paths, never reset tokens, chat identifiers or URL fragments.
export function redactAnalyticsEvent(event) {
  try {
    const url = new URL(event.url);
    url.search = '';
    url.hash = '';
    return { ...event, url: url.href };
  } catch {
    return null;
  }
}
