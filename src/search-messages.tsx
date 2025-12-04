import { List, Icon, ActionPanel, Action, Image } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import { useState } from "react";
import { createBeeperOAuth, focusApp } from "./api";
import { t } from "./locales";
import { useMessageSearch } from "./hooks/useMessageSearch";
import { safeAvatarPath } from "./utils/avatar";
import { getNetworkIcon } from "./utils/networkIcons";

/**
 * Returns chat icon - contact avatar for DMs, network icon for groups.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getChatIcon(chat: any): Image.ImageLike {
  if (!chat) return Icon.Bubble;

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

function SearchMessagesCommand() {
  const translations = t();
  const [searchText, setSearchText] = useState("");
  const { data: messages = [], isLoading } = useMessageSearch(searchText);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={translations.commands.searchMessages.searchPlaceholder}
      onSearchTextChange={setSearchText}
      throttle
    >
      {searchText === "" ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title={translations.commands.searchMessages.emptyTitle}
          description={translations.commands.searchMessages.emptyDescription}
        />
      ) : !isLoading && messages.length === 0 ? (
        <List.EmptyView
          icon={Icon.Message}
          title={translations.commands.searchMessages.noResultsTitle}
          description={translations.commands.searchMessages.noResultsDescription}
        />
      ) : (
        messages.map((message) => (
          <List.Item
            key={message.id}
            icon={getChatIcon(message.chat)}
            title={
              message.senderName
                ? `${message.senderName}: ${message.text}`
                : message.text || translations.common.unknownMessage
            }
            subtitle={message.chat?.title || translations.common.unnamedChat}
            accessories={[{ date: new Date(message.timestamp) }]}
            actions={
              <ActionPanel>
                <Action
                  title={translations.common.openInBeeper}
                  icon={Icon.Window}
                  onAction={() => focusApp({ chatID: message.chatID, messageSortKey: String(message.sortKey) })}
                />
                <Action.CopyToClipboard title={translations.common.copyMessageText} content={message.text || ""} />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

export default withAccessToken(createBeeperOAuth())(SearchMessagesCommand);
