import { Client } from '@notionhq/client';

let _client: Client | undefined;

/**
 * Returns a lazily-initialized Notion client using NOTION_API_KEY from the
 * environment. Must only be called from server-side code (Server Components,
 * Route Handlers, or Server Actions).
 */
export function getNotionClient(): Client {
  if (!_client) {
    _client = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return _client;
}
