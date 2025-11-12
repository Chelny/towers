"use client";

import { InputEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plural, useLingui } from "@lingui/react/macro";
import { InstantMessageWithRelations, PlayerListWithRelations, UserMute } from "db";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import ConversationModal from "@/components/game/ConversationModal";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { ROUTE_TOWERS } from "@/constants/routes";
import { SocketEvents } from "@/constants/socket-events";
import { useModal } from "@/context/ModalContext";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";

type PlayerInformationModalProps = {
  player?: PlayerListWithRelations
  isRatingsVisible?: boolean | null
  onCancel: () => void
}

export default function PlayerInformationModal({
  player,
  isRatingsVisible = false,
  onCancel,
}: PlayerInformationModalProps): ReactNode {
  const { socketRef, isConnected, session } = useSocket();
  const { t } = useLingui();
  const router = useRouter();
  const { openModal } = useModal();
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [targetNetDelay, setTargetNetDelay] = useState<number | null>(null);
  const [myNetDelay, setMyNetDelay] = useState<number | null>(null);
  const [watchUserAtTable, setWatchUserAtTable] = useState<string | null>(null);
  const [idleTime, setIdleTime] = useState<number | null>(null);
  const username: string | null | undefined = player?.user?.username;
  const rating: number | undefined = player?.stats?.rating;
  const gamesCompleted: number | undefined = player?.stats?.gamesCompleted;
  const wins: number | undefined = player?.stats?.wins;
  const losses: number | undefined = player?.stats?.losses;
  const streak: number | undefined = player?.stats?.streak;

  const {
    error: sendInstantMessageError,
    trigger: sendInstantMessage,
    isMutating: isInstantMessageMutating,
  } = useSWRMutation(
    "/api/conversations/messages",
    (url: string, { arg }: { arg: { recipientId: string; text: string } }) =>
      fetcher<InstantMessageWithRelations>(url, { method: "POST", body: JSON.stringify(arg) }),
    {
      onSuccess(response: ApiResponse<InstantMessageWithRelations>) {
        if (response.success && response.data) {
          onCancel?.();
          openModal(ConversationModal, { id: response.data.conversationId });
        }
      },
    },
  );

  const {
    data: canWatchUserAtTableResponse,
    mutate: canWatchUserAtTable,
    isLoading: isLoadingCanWatchUserAtTable,
  } = useSWR<ApiResponse<{ roomId: string; tableId: string }>>(
    `/api/games/towers/players/${player?.id}/can-watch-at-table`,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const {
    error: toggleMuteUserError,
    trigger: toggleMuteUser,
    isMutating: isToggleMuteUserMutating,
  } = useSWRMutation("/api/users/mutes", (url: string, { arg }: { arg: { mutedUserId: string | undefined } }) =>
    fetcher<void>(url, { method: "PATCH", body: JSON.stringify(arg) }),
  );

  useEffect(() => {
    if (!player?.id || !session?.user?.id || isCurrentUser) return;
    setIsCurrentUser(player?.id === session?.user?.id);
    canWatchUserAtTable();
  }, [player?.id, session?.user?.id]);

  useEffect(() => {
    if (!player?.lastActiveAt) return;

    const lastActiveAt: number = new Date(player?.lastActiveAt).getTime();
    const idleMs: number = Date.now() - lastActiveAt;
    const idleSeconds: number = Number((idleMs / 1000).toFixed(2));

    setIdleTime(idleSeconds);
  }, [player?.lastActiveAt]);

  useEffect(() => {
    if (canWatchUserAtTableResponse?.data) {
      const roomId: string = canWatchUserAtTableResponse?.data.roomId;
      const tableId: string = canWatchUserAtTableResponse?.data.tableId;
      setWatchUserAtTable(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`);
    } else {
      setWatchUserAtTable(null);
    }
  }, [canWatchUserAtTableResponse?.data]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handlePlayerJoin = (): void => {
      canWatchUserAtTable();
    };

    const handlePlayerLeave = (): void => {
      canWatchUserAtTable();
    };

    // TODO: Listen to when user is playing and when they're not
    socketRef.current?.on(SocketEvents.TABLE_PLAYER_JOINED, handlePlayerJoin);
    socketRef.current?.on(SocketEvents.TABLE_PLAYER_LEFT, handlePlayerLeave);

    return () => {
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_JOINED, handlePlayerJoin);
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_LEFT, handlePlayerLeave);
    };
  }, [isConnected]);

  const handleSendMessage = async (): Promise<void> => {
    const text: string | undefined = message?.trim();

    if (player?.id && text && text !== "") {
      await sendInstantMessage({ recipientId: player?.id, text });
    }
  };

  const handleMuteUser = async (): Promise<void> => {
    await toggleMuteUser({ mutedUserId: player?.id });
  };

  const handleWatch = (): void => {
    if (watchUserAtTable) {
      router.push(watchUserAtTable);
    }

    onCancel?.();
  };

  const handlePing = (): void => {
    if (!socketRef.current || !player?.id) return;

    const startTime: number = Date.now();

    socketRef.current?.emit(
      SocketEvents.PING_REQUEST,
      { userId: player?.id },
      (response: { success: boolean; message: string; data: { roundTrip?: number } }) => {
        if (response.success) {
          const myDelayMs: number = Date.now() - startTime;
          const targetDelayMs: number = response.data.roundTrip ?? 0;

          // Convert to seconds
          const myDelaySeconds: number = Number((myDelayMs / 1000).toFixed(2));
          const targetDelaySeconds: number = Number((targetDelayMs / 1000).toFixed(2));

          setMyNetDelay(myDelaySeconds);
          setTargetNetDelay(targetDelaySeconds);
        }
      },
    );
  };

  return (
    <Modal
      title={t({ message: `Player information of ${username}` })}
      cancelText={t({ message: "Close" })}
      dataTestId="player-information"
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-2">
        {isRatingsVisible && (
          <div>
            {t({ message: `Rating: ${rating}` })} <br />
            {t({ message: `Games Completed: ${gamesCompleted}` })} <br />
            {t({ message: `Wins: ${wins}` })} <br />
            {t({ message: `Losses: ${losses}` })} <br />
            {t({ message: `Streak: ${streak}` })} <br />
          </div>
        )}
        {!isCurrentUser && (
          <Input
            id="instantMessage"
            label={t({ message: "Send instant message" })}
            defaultValue={message}
            inlineButtonText={t({ message: "Send" })}
            disabled={isInstantMessageMutating}
            dataTestId="player-information_input-text_message"
            onInput={(event: InputEvent<HTMLInputElement>) => setMessage((event.target as HTMLInputElement).value)}
            onInlineButtonClick={handleSendMessage}
          />
        )}
        <div>
          <Plural
            value={idleTime}
            zero={`Idle time: ${idleTime} seconds.`}
            one={`Idle time: ${idleTime} second.`}
            other={`Idle time: ${idleTime} seconds.`}
          />
        </div>
        <div className="flex flex-col gap-2">
          {!isCurrentUser && (
            <div className="flex items-center gap-2">
              <div className="w-fit">
                <Button
                  className="w-auto whitespace-nowrap"
                  dataTestId="player-information_button_ping"
                  onClick={handlePing}
                >
                  {t({ message: "Ping" })}
                </Button>
              </div>
              {targetNetDelay !== null && myNetDelay !== null && (
                <div className="text-sm">
                  <Plural
                    value={targetNetDelay}
                    zero={`${username}’s net delay: ${targetNetDelay} seconds.`}
                    one={`${username}’s net delay: ${targetNetDelay} second.`}
                    other={`${username}’s net delay: ${targetNetDelay} seconds.`}
                  />
                  <br />
                  <Plural
                    value={myNetDelay}
                    zero={`My net delay: ${myNetDelay} seconds.`}
                    one={`My net delay: ${myNetDelay} second.`}
                    other={`My net delay: ${myNetDelay} seconds.`}
                  />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            {!isCurrentUser && (
              <div className="w-fit -mb-4">
                <Checkbox
                  id="muteUser"
                  label={t({ message: "Ignore" })}
                  defaultChecked={player?.user?.mutedUsers?.some(
                    (mutedUser: UserMute) => mutedUser.mutedUserId === player?.id,
                  )}
                  disabled={isToggleMuteUserMutating}
                  onChange={handleMuteUser}
                />
              </div>
            )}
            {!isLoadingCanWatchUserAtTable && watchUserAtTable && (
              <Button className="w-fit" dataTestId="player-information_button_watch" onClick={handleWatch}>
                {t({ message: "Watch" })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
