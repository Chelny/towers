"use client";

import { KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { format } from "date-fns";
import {
  ConversationParticipant,
  ConversationParticipantWithRelations,
  ConversationWithRelations,
  InstantMessageType,
  InstantMessageWithRelations,
  TableChatMessageType,
} from "db";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Input, { InputImperativeHandle } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { SocketEvents } from "@/constants/socket-events";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";
import { JsonValue } from "@/prisma/app/generated/prisma/client/runtime/library";
import { getDateFnsLocale } from "@/translations/languages";

type ConversationModalProps = {
  id: string
  onCancel: () => void
}

export default function ConversationModal({ id, onCancel }: ConversationModalProps): ReactNode {
  const { socketRef, isConnected, session } = useSocket();
  const { i18n, t } = useLingui();
  const [conversation, setConversation] = useState<ConversationWithRelations>();
  const [otherParticipant, setOtherParticipant] = useState<ConversationParticipantWithRelations>();
  const [conversationTime, setConversationTime] = useState<string>();
  const messageInputRef = useRef<InputImperativeHandle>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const {
    data: conversationResponse,
    error: conversationError,
    mutate: loadConversation,
    isLoading: isLoadingConversation,
  } = useSWR<ApiResponse<ConversationWithRelations>>(`/api/conversations/${id}`, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    error: markConversationAsReadError,
    trigger: markConversationAsRead,
    isMutating: isMarkConversationAsReadMutating,
  } = useSWRMutation(`/api/conversations/${id}/participants/${session?.user.id}/read`, (url: string) =>
    fetcher<void>(url, { method: "PATCH" }),
  );

  const {
    error: sendInstantMessageError,
    trigger: sendInstantMessage,
    isMutating: isInstantMessageMutating,
  } = useSWRMutation(
    `/api/conversations/${id}/messages`,
    (url: string, { arg }: { arg: { text: string | undefined } }) =>
      fetcher<InstantMessageWithRelations>(url, { method: "PUT", body: JSON.stringify(arg) }),
    {
      onSuccess(response: ApiResponse<InstantMessageWithRelations>) {
        if (response.success) {
          messageInputRef.current?.clear();
        }
      },
    },
  );

  const {
    error: toggleMuteUserError,
    trigger: toggleMuteUser,
    isMutating: isToggleMuteUserMutating,
  } = useSWRMutation("/api/users/mutes", (url: string, { arg }: { arg: { mutedUserId: string | undefined } }) =>
    fetcher<void>(url, { method: "PATCH", body: JSON.stringify(arg) }),
  );

  const translatedMessages = useMemo(() => {
    return conversation?.messages
      .filter((instantMessage: InstantMessageWithRelations) => {
        const visibleToUserId: string | null = instantMessage.visibleToUserId;
        return !visibleToUserId || visibleToUserId === session?.user.id;
      })
      .map((instantMessage: InstantMessageWithRelations) => {
        const translatedMessage: string =
          instantMessage.text ?? getInstantMessageAutomatedMessage(instantMessage.type, instantMessage.textVariables);

        return {
          ...instantMessage,
          text: translatedMessage,
        };
      });
  }, [conversation?.messages]);

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    if (conversationResponse?.data) {
      const otherParticipant: ConversationParticipantWithRelations | undefined =
        conversationResponse.data.participants.find(
          (conversationParticipant: ConversationParticipant) => conversationParticipant.userId !== session?.user.id,
        );
      setConversation(conversationResponse.data);
      setOtherParticipant(otherParticipant);
      setConversationTime(
        format(conversationResponse.data.createdAt, "EEE MMM dd HH:mm:ss", { locale: getDateFnsLocale(i18n.locale) }),
      );
    }
  }, [conversationResponse?.data]);

  useEffect(() => {
    scrollToBottom();
    markConversationAsRead();
  }, [conversation?.messages.length]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleUpdateConversation = ({ conversation }: { conversation: ConversationWithRelations }): void => {
      setConversation(conversation);
    };

    socketRef.current?.on(SocketEvents.CONVERSATION_MESSAGE_SENT, handleUpdateConversation);

    return () => {
      socketRef.current?.off(SocketEvents.CONVERSATION_MESSAGE_SENT, handleUpdateConversation);
    };
  }, [isConnected]);

  const getInstantMessageAutomatedMessage = (type: InstantMessageType, textVariables: JsonValue | null): string => {
    // @ts-ignore
    const { username } = textVariables;
    let message: string = "";

    switch (type) {
      case InstantMessageType.USER_ONLINE:
        message = i18n._("{username} is online.", { username });
        break;

      case InstantMessageType.USER_OFFLINE:
        message = i18n._("{username} is offline.", { username });
        break;

      default:
        break;
    }

    return `*** ${message}`;
  };

  const scrollToBottom = (): void => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleSendMessage = async (): Promise<void> => {
    const text: string | undefined = messageInputRef.current?.value?.trim();

    if (text !== "") {
      await sendInstantMessage({ text });
    }
  };

  const handleMuteUser = async (): Promise<void> => {
    await toggleMuteUser({ mutedUserId: otherParticipant?.userId });
  };

  return (
    <Modal
      title={i18n._("Instant message with {username} started {time}", {
        username: otherParticipant?.user?.username,
        time: conversationTime,
      })}
      isChatModal
      cancelText={t({ message: "Close" })}
      dataTestId="instant-message"
      onCancel={onCancel}
    >
      <div
        className={clsx(
          "overflow-auto h-48 p-2 border border-gray-300 bg-white",
          "dark:border-dark-card-border dark:bg-dark-background",
        )}
      >
        {translatedMessages?.map((instantMessage: InstantMessageWithRelations) => (
          <div key={instantMessage.id} className="flex">
            {instantMessage.type === TableChatMessageType.CHAT && (
              <span className="order-1">{instantMessage.user?.username}:&nbsp;</span>
            )}
            <span
              className={clsx(
                instantMessage.type === TableChatMessageType.CHAT
                  ? "order-2"
                  : "text-gray-500 dark:text-dark-text-muted",
              )}
            >
              {instantMessage.text}
            </span>
          </div>
        ))}
        <div ref={conversationEndRef} />
      </div>

      <Input
        ref={messageInputRef}
        type="text"
        id="instantMessage"
        inlineButtonText={t({ message: "Send" })}
        disabled={isLoadingConversation || isInstantMessageMutating}
        dataTestId="instant-message_input-text_message"
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          // Prevent submitting modal form
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
        onInlineButtonClick={handleSendMessage}
      />

      <div className="flex items-center justify-between">
        <Checkbox
          id="friendsOnlyInstantMessages"
          label={t({ message: "Allow instant messages from my friends only." })}
          disabled
          dataTestId="instant-message_input-checkbox_friends-only-instant-messages"
        />
      </div>

      <div className="flex justify-between">
        <Button dataTestId="instant-message_button_ignore" onClick={handleMuteUser}>
          {t({ message: "Ignore" })}
        </Button>
      </div>
    </Modal>
  );
}
