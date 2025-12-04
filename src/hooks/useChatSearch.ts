import { useBeeperDesktop } from "../api";

export function useChatSearch(searchText: string, includeEmpty = false) {
  return useBeeperDesktop(
    async (client, query, includeEmptyResults) => {
      if (!query && !includeEmptyResults) return [];
      const allChats = [];
      const params = query ? { query } : {};
      for await (const chat of client.chats.search(params)) {
        allChats.push(chat);
      }
      return allChats;
    },
    [searchText, includeEmpty] as [string, boolean],
  );
}
