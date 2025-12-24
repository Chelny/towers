"use client";

import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import { ProfanityFilter } from "db/enums";
import { Socket } from "socket.io-client";
import useSWRMutation from "swr/mutation";
import DeclineAllInvitationsCheckbox from "@/components/game/DeclineAllInvitationsCheckbox";
import Modal from "@/components/ui/Modal";
import RadioButtonGroup from "@/components/ui/RadioButtonGroup";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { useSocket } from "@/context/SocketContext";
import { SocketCallback } from "@/interfaces/socket";
import { fetcher } from "@/lib/fetcher";

interface GameOptionsModalProps {
  profanityFilter: ProfanityFilter
  onSetProfanityFilter: (value: ProfanityFilter) => void
  onCancel: () => void
}

export default function GameOptionsModal({
  profanityFilter,
  onSetProfanityFilter,
  onCancel,
}: GameOptionsModalProps): ReactNode {
  const { t } = useLingui();
  const { socketRef, isConnected, session } = useSocket();
  const [isDeclineAll, setIsDeclineAll] = useState<boolean>(false);

  const { trigger: updateSettings, isMutating } = useSWRMutation(
    `/api/users/${session?.user.id}/settings`,
    (url: string, { arg }: { arg: { profanityFilter: ProfanityFilter } }) =>
      fetcher<{ profanityFilter: ProfanityFilter }>(url, { method: "PATCH", body: JSON.stringify(arg) }),
    {
      revalidate: false,
      onSuccess: (response: ApiResponse<{ profanityFilter: ProfanityFilter }>) => {
        if (response.success && response.data) {
          onSetProfanityFilter(response.data?.profanityFilter);
        }
      },
    },
  );

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const emitInitialData = (): void => {
      socket.emit(ClientToServerEvents.TABLE_INVITATIONS_BLOCKED_CHECK, {}, (response: SocketCallback<boolean>) => {
        if (response.success && response.data) {
          setIsDeclineAll(response.data);
        }
      });
    };

    if (socket.connected) {
      emitInitialData();
    } else {
      socket.once("connect", () => {
        emitInitialData();
      });
    }

    socket.on("reconnect", () => emitInitialData());

    return () => {
      socket.off("connect");
      socket.off("reconnect", emitInitialData);
    };
  }, [isConnected, socketRef, session?.user.id]);

  const handleToggleDeclineAll = (value: boolean): void => {
    setIsDeclineAll(value);

    if (!isConnected || !socketRef.current) return;

    socketRef.current.emit(
      value ? ClientToServerEvents.TABLE_INVITATIONS_BLOCK : ClientToServerEvents.TABLE_INVITATIONS_ALLOW,
    );
  };

  const handleUpdateProfanityFilter = async (value: ProfanityFilter): Promise<void> => {
    await updateSettings({ profanityFilter: value });
  };

  return (
    <Modal
      title={t({ message: "Options" })}
      cancelText={t({ message: "Done" })}
      dataTestId="game-options"
      onCancel={onCancel}
    >
      <DeclineAllInvitationsCheckbox
        isDeclineAll={isDeclineAll}
        isDisabled={!isConnected}
        onToggleDeclineAll={handleToggleDeclineAll}
      />
      <RadioButtonGroup
        id="profanity-filter"
        label={t({ message: "Profanity Filter" })}
        inline
        defaultValue={profanityFilter}
        required
        disabled={!isConnected || isMutating}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const value: ProfanityFilter = event.target.value as ProfanityFilter;
          handleUpdateProfanityFilter(value);
        }}
      >
        <RadioButtonGroup.Option id="none" label={t({ message: "None" })} value={ProfanityFilter.NONE} />
        <RadioButtonGroup.Option id="weak" label={t({ message: "Weak" })} value={ProfanityFilter.WEAK} />
        <RadioButtonGroup.Option id="strong" label={t({ message: "Strong" })} value={ProfanityFilter.STRONG} />
      </RadioButtonGroup>
    </Modal>
  );
}
