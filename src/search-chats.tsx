import { ActionPanel, Action, List, Icon, Image } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import { useState } from "react";
import { useBeeperDesktop, createBeeperOAuth, focusApp } from "./api";
import { t } from "./locales";

function getNetworkIcon(network: string): Image.ImageLike {
  const networkLower = network.toLowerCase().replace(/[/\s-]/g, "");

  const iconMap: Record<string, string> = {
    slack: "slack.svg",
    whatsapp: "whatsapp.svg",
    telegram: "telegram.svg",
    discord: "discord.svg",
    instagram: "instagram.svg",
    facebook: "facebook.svg",
    facebookmessenger: "messenger.svg",
    messenger: "messenger.svg",
    signal: "signal.svg",
    imessage: "imessage.svg",
    twitter: "twitter.svg",
    email: "email.svg",
    googlemessages: "google-messages.svg",
  };

  return iconMap[networkLower] || Icon.Message;
}

function SearchChatsCommand() {
  const translations = t();
  const [searchText, setSearchText] = useState("");
  const { data: chats = [], isLoading } = useBeeperDesktop(
    async (client) => {
      if (!searchText) {
        return [];
      }
      const allChats = [];
      for await (const chat of client.chats.search({ query: searchText })) {
        allChats.push(chat);
      }
      return allChats;
    },
    [searchText],
  );

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={translations.commands.searchChats.searchPlaceholder}
      onSearchTextChange={setSearchText}
      throttle
    >
      {searchText === "" ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title={translations.commands.searchChats.emptyTitle}
          description={translations.commands.searchChats.emptyDescription}
        />
      ) : (
        chats.map((chat) => (
          <List.Item
            key={chat.id}
            icon={getNetworkIcon(chat.network)}
            title={chat.title || translations.common.unnamedChat}
            subtitle={chat.network}
            accessories={[
              ...(chat.unreadCount > 0
                ? [{ text: translations.commands.unreadChats.unreadCount(chat.unreadCount) }]
                : []),
              ...(chat.isPinned ? [{ icon: Icon.Pin }] : []),
              ...(chat.isMuted ? [{ icon: Icon.SpeakerOff }] : []),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={translations.common.openInBeeper}
                  icon={Icon.Window}
                  onAction={() => focusApp({ chatID: chat.id })}
                />
                <Action.CopyToClipboard title={translations.common.copyChatId} content={chat.id} />
              </ActionPanel>
            }
          />
        ))
      )}
      {searchText !== "" && !isLoading && chats.length === 0 && (
        <List.EmptyView
          icon={Icon.Message}
          title={translations.commands.searchChats.noResultsTitle}
          description={translations.commands.searchChats.noResultsDescription}
        />
      )}
    </List>
  );
}

export default withAccessToken(createBeeperOAuth())(SearchChatsCommand);
