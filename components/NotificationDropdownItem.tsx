"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { NotificationType, TowersNotificationWithRelations } from "db";
import { MdOutlineDelete } from "react-icons/md";
import useSWRMutation from "swr/mutation";
import AlertModal from "@/components/game/AlertModal";
import TableInvitationModal from "@/components/game/TableInvitationModal";
import { ROUTE_TOWERS } from "@/constants/routes";
import { useModal } from "@/context/ModalContext";
import { useOnScreen } from "@/hooks/useOnScreen";
import { fetcher } from "@/lib/fetcher";

type NotificationDropdownItemProps = {
  notification: TowersNotificationWithRelations
}

export const NotificationDropdownItem = ({ notification }: NotificationDropdownItemProps) => {
  const router = useRouter();
  const { i18n, t } = useLingui();
  const { openModal, closeModal } = useModal();
  const [ref, isInView] = useOnScreen<HTMLLIElement>();

  const {
    error: markNotificationAsReadError,
    trigger: markNotificationAsRead,
    isMutating: isMarkNotificationAsReadMutating,
  } = useSWRMutation(
    `/api/games/towers/notifications/${notification.id}`,
    (url: string) => fetcher<TowersNotificationWithRelations>(url, { method: "PATCH" }),
    {
      onSuccess(response: ApiResponse<TowersNotificationWithRelations>) {
        if (response.success) {
          console.log("CHELNY markNotificationAsRead", response);
        }
      },
    },
  );
  const {
    error: removeNotificationError,
    trigger: removeNotification,
    isMutating: isRemoveNotificationMutating,
  } = useSWRMutation(
    `/api/games/towers/notifications/${notification.id}`,
    (url: string) => fetcher<void>(url, { method: "DELETE" }),
    {
      onSuccess(response: ApiResponse<void>) {
        if (response.success) {
          console.log("CHELNY removeNotification", response);
        }
      },
    },
  );

  const setNotificationLabel = (notification: TowersNotificationWithRelations): string => {
    console.log("CHELNY setNotificationLabel", notification);
    switch (notification.type) {
      case NotificationType.TABLE_INVITE:
        // @ts-ignore
        return i18n._("Invitation to table #{tableNumber}", {
          tableNumber: notification.tableInvitation?.table.tableNumber,
        });

      case NotificationType.TABLE_INVITE_DECLINED:
        // @ts-ignore
        return notification.tableInvitation?.declinedReason
          ? i18n._("{username} declined your invitation. Reason: {reason}", {
              // @ts-ignore
              username: notification.tableInvitation?.inviteePlayer.user.username,
              // @ts-ignore
              reason: notification.tableInvitation?.declinedReason,
            })
          : i18n._("{username} declined your invitation.", {
              // @ts-ignore
              username: notification.tableInvitation?.inviteePlayer.user.username,
            });

      case NotificationType.TABLE_BOOTED:
        return i18n._("You have been booted from table #{tableNumber} by {host}.", {
          // @ts-ignore
          tableNumber: notification.bootedFromTable?.table.tableNumber,
          // @ts-ignore
          host: notification.bootedFromTable?.table.hostPlayer.user.username,
        });

      default:
        return "";
    }
  };

  const openNotificationModal = async (notification: TowersNotificationWithRelations): Promise<void> => {
    switch (notification.type) {
      case NotificationType.TABLE_INVITE:
        if (!notification.tableInvitation) return;
        openModal(TableInvitationModal, {
          tableInvitation: notification.tableInvitation,
          onAcceptInvitation: (roomId: string, tableId: string) => {
            router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`);
            closeModal();
          },
        });
        break;

      case NotificationType.TABLE_INVITE_DECLINED:
        if (!notification.tableInvitation) return;
        openModal(AlertModal, {
          title: t({ message: "Invitation Declined" }),
          message: notification.tableInvitation.declinedReason
            ? i18n._("{username} declined your invitation. Reason: {reason}", {
                username: notification.tableInvitation.inviteePlayer.user.username,
                reason: notification.tableInvitation.declinedReason,
              })
            : i18n._("{username} declined your invitation.", {
                username: notification.tableInvitation.inviteePlayer.user.username,
              }),
          testId: "table-invite-declined",
        });
        break;

      case NotificationType.TABLE_BOOTED:
        if (!notification.bootedFromTable) return;
        openModal(AlertModal, {
          title: t({ message: "Booted from table" }),
          message: i18n._("You have been booted from table #{tableNumber} by {host}.", {
            tableNumber: notification.bootedFromTable.table.tableNumber,
            host: notification.bootedFromTable.table.hostPlayer.user.username,
          }),
          testId: "booted-user",
        });
        break;
    }
  };

  const handleMarkNotificationAsRead = async (): Promise<void> => {
    console.log("CHELNY markNotificationAsRead");
    await markNotificationAsRead();
  };

  const handleRemoveNotification = async (): Promise<void> => {
    console.log("CHELNY handleRemoveNotification");
    await removeNotification();
  };

  useEffect(() => {
    if (isInView && !notification.readAt) {
      handleMarkNotificationAsRead();
    }
  }, [isInView, notification]);

  return (
    <li ref={ref} className={clsx("flex justify-between items-center gap-2 w-full", "hover:bg-slate-700")}>
      <button
        type="button"
        className={clsx("flex-1 px-2 py-1 text-start", notification.readAt ? "font-normal" : "font-semibold")}
        onClick={() => openNotificationModal(notification)}
      >
        {setNotificationLabel(notification)}
      </button>

      <button
        type="button"
        className="p-2 text-red-500 cursor-pointer"
        aria-label={t({ message: "Delete notification" })}
        onClick={handleRemoveNotification}
      >
        <MdOutlineDelete aria-hidden="true" />
      </button>
    </li>
  );
};
