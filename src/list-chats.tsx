import { useState } from "react";
import { ActionPanel, Detail, List, Action, Icon, Image } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import { useBeeperDesktop, createBeeperOAuth, focusApp } from "./api";
import { t } from "./locales";
import { safeAvatarPath } from "./utils/avatar";
import { getNetworkIcon } from "./utils/networkIcons";

/**
 * Returns chat icon - contact avatar for DMs, network icon for groups.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getChatIcon(chat: any): Image.ImageLike {
  // For 1:1 chats, try to get the other person's avatar
  if (chat.type !== "group" && chat.participants?.items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherParticipant = chat.participants.items.find((p: any) => !p.isSelf);
    if (otherParticipant?.imgURL) {
      const validatedPath = safeAvatarPath(otherParticipant.imgURL);
      if (validatedPath) {
        return { source: validatedPath, mask: Image.Mask.Circle };
      }
    }
  }
  return getNetworkIcon(chat.network);
}

/**
 * Render a searchable list of Beeper chats with actions to open the chat in Beeper, view details, and copy the chat ID.
 *
 * The list is populated from Beeper Desktop search results filtered by the search bar; each item shows network-specific icon, title (or a localized unnamed fallback), type, and last activity when available.
 *
 * @returns A Raycast List component populated with chat items and an empty state when no chats are found.
 */
function ListChatsCommand() {
  const translations = t();
  const [searchText, setSearchText] = useState("");
  const { data: chats = [], isLoading } = useBeeperDesktop(
    async (client) => {
      const allChats = [];
      const searchParams = searchText ? { query: searchText } : {};
      for await (const chat of client.chats.search(searchParams)) {
        allChats.push(chat);
      }
      return allChats;
    },
    [searchText],
  );

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={translations.commands.listChats.searchPlaceholder}
      onSearchTextChange={setSearchText}
      throttle
    >
      {chats.map((chat) => (
        <List.Item
          key={chat.id}
          icon={getChatIcon(chat)}
          title={chat.title || translations.common.unnamedChat}
          subtitle={chat.network}
          accessories={[{ text: chat.type }, ...(chat.lastActivity ? [{ date: new Date(chat.lastActivity) }] : [])]}
          actions={
            <ActionPanel>
              <Action
                title={translations.common.openInBeeper}
                icon={Icon.Window}
                onAction={() => focusApp({ chatID: chat.id })}
              />
              <Action.Push
                title={translations.common.showDetails}
                icon={Icon.Info}
                target={
                  <Detail
                    markdown={`# ${chat.title || translations.common.unnamedChat}

**${translations.common.details.id}:** ${chat.id}
**${translations.common.details.accountId}:** ${chat.accountID}
**${translations.common.details.network}:** ${chat.network}
**${translations.common.details.type}:** ${chat.type}
**${translations.common.details.unreadCount}:** ${chat.unreadCount}
**${translations.common.details.isPinned}:** ${chat.isPinned ? translations.common.yes : translations.common.no}
**${translations.common.details.isMuted}:** ${chat.isMuted ? translations.common.yes : translations.common.no}
**${translations.common.details.isArchived}:** ${chat.isArchived ? translations.common.yes : translations.common.no}
**${translations.common.details.lastActivity}:** ${chat.lastActivity || translations.common.details.na}`}
                  />
                }
              />
              <Action.CopyToClipboard title={translations.common.copyChatId} content={chat.id} />
            </ActionPanel>
          }
        />
      ))}
      {!isLoading && chats.length === 0 && (
        <List.EmptyView
          icon={Icon.Message}
          title={translations.commands.listChats.emptyTitle}
          description={translations.commands.listChats.emptyDescription}
        />
      )}
    </List>
  );
}

export default withAccessToken(createBeeperOAuth())(ListChatsCommand);
