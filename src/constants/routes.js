/** Tab id <-> URL path (slug). Path = /overview, /ai-chat, /activity-log, ... */
export const tabToPath = (tabId) => `/${(tabId || 'overview').replace(/_/g, '-')}`;

const pathToTabMap = Object.fromEntries(
  ['overview', 'customers', 'segment', 'sales', 'marketing', 'zalo', 'predictions', 'ai_chat', 'report', 'datamap', 'activity_log', 'settings', 'user_mgmt']
    .map(id => [id.replace(/_/g, '-'), id])
);

/** /overview -> overview, /ai-chat -> ai_chat. Unknown path -> overview */
export const pathToTab = (pathname) => {
  const slug = pathname.replace(/^\/+|\/+$/g, '') || 'overview';
  return pathToTabMap[slug] ?? 'overview';
};
