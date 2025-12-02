import { List, ActionPanel, Action, Icon, Image } from "@raycast/api";
import { Translations } from "../locales/en";
import { safeAvatarPath } from "../utils/avatar";

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

interface Chat {
  id: string;
  network: string;
  title?: string;
  avatarUrl?: string;
  onOpen?: () => void;
  detailsTarget?: React.ReactNode;
}

interface ChatListItemProps {
  chat: Chat;
  translations: Translations;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessories?: Array<{ text?: string; icon?: any; date?: Date }>;
  showDetails?: boolean;
}

function getChatIcon(chat: Chat): Image.ImageLike {
  if (chat.avatarUrl) {
    const validatedPath = safeAvatarPath(chat.avatarUrl);
    if (validatedPath) {
      return { source: validatedPath, mask: Image.Mask.Circle };
    }
  }
  return getNetworkIcon(chat.network);
}

export function ChatListItem({ chat, translations, accessories = [], showDetails = false }: ChatListItemProps) {
  return (
    <List.Item
      key={chat.id}
      icon={getChatIcon(chat)}
      title={chat.title || translations.common.unnamedChat}
      subtitle={chat.network}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action title={translations.common.openInBeeper} icon={Icon.Window} onAction={() => chat.onOpen?.()} />
          {showDetails && chat.detailsTarget && (
            <Action.Push title={translations.common.showDetails} icon={Icon.Info} target={chat.detailsTarget} />
          )}
          <Action.CopyToClipboard title={translations.common.copyChatId} content={chat.id} />
        </ActionPanel>
      }
    />
  );
}
