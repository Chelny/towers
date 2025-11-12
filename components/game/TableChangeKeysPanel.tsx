"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { TowersPlayerControlKeys } from "db";
import useSWRMutation from "swr/mutation";
import AlertMessage from "@/components/ui/AlertMessage";
import Button from "@/components/ui/Button";
import { fKeyMessages } from "@/constants/f-key-messages";
import { NUM_TABLE_SEATS } from "@/constants/game";
import { useSocket } from "@/context/SocketContext";
import { TablePanelView } from "@/enums/TablePanelView";
import { fetcher } from "@/lib/fetcher";
import { getReadableKeyLabel } from "@/lib/keyboard/getReadableKeyLabel";
import { keyboardKeyLabels } from "@/lib/keyboard/keyboardKeyLabels";

interface TableChangeKeysPanelProps {
  controlKeys: TowersPlayerControlKeys | null
  onChangeView: (view: TablePanelView) => void
}

type BindingKey =
  | "moveLeft"
  | "moveRight"
  | "cycleBlock"
  | "dropPiece"
  | "useItem"
  | `useItemOnPlayer${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

export default function TableChangeKeysPanel({
  controlKeys: initialControlKeys,
  onChangeView,
}: TableChangeKeysPanelProps): ReactNode {
  const { i18n, t } = useLingui();
  const { isConnected } = useSocket();
  const [controlKeys, setControlKeys] = useState<TowersPlayerControlKeys | null>(initialControlKeys);
  const [selectedKey, setSelectedKey] = useState<keyof TowersPlayerControlKeys | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const validKeys: string[] = Object.keys(keyboardKeyLabels);
  const bindingKeys: BindingKey[] = [
    "moveLeft",
    "moveRight",
    "cycleBlock",
    "dropPiece",
    "useItem",
    "useItemOnPlayer1",
    "useItemOnPlayer2",
    "useItemOnPlayer3",
    "useItemOnPlayer4",
    "useItemOnPlayer5",
    "useItemOnPlayer6",
    "useItemOnPlayer7",
    "useItemOnPlayer8",
  ];

  const {
    error: updateControlKeysError,
    trigger: updateControlKeys,
    isMutating: isUpdateControlKeysMutating,
  } = useSWRMutation(
    "/api/users/control-keys",
    (url: string, { arg }: { arg: { controlKeys: TowersPlayerControlKeys | null } }) =>
      fetcher<void>(url, { method: "PATCH", body: JSON.stringify(arg) }),
  );

  const duplicatedKeys = useMemo(() => {
    const duplicates: Set<string> = new Set<string>();

    if (controlKeys) {
      const seen: Set<string> = new Set<string>();

      for (const field of bindingKeys) {
        const key: string = controlKeys[field];

        if (seen.has(key)) {
          duplicates.add(key);
        } else {
          seen.add(key);
        }
      }
    }
    return duplicates;
  }, [controlKeys]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!selectedKey) return;
      if (!validKeys.includes(e.code)) return;

      setControlKeys((prev: TowersPlayerControlKeys | null) => {
        if (!prev) return prev;

        return {
          ...prev,
          [selectedKey]: e.code,
        };
      });
      setSelectedKey(null);
      setShowErrorMessage(false);
      setShowSuccessMessage(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedKey, validKeys]);

  const handleSave = async (): Promise<void> => {
    if (duplicatedKeys.size > 0) {
      setShowErrorMessage(true);
      setShowSuccessMessage(false);
    } else {
      setShowErrorMessage(false);
      setShowSuccessMessage(true);
      await updateControlKeys({ controlKeys });
    }
  };

  const renderRow = (label: string, key: BindingKey, isEditable: boolean = false): ReactNode => {
    const isDuplicate: boolean = !!controlKeys?.[key] && duplicatedKeys.has(controlKeys[key]);
    return (
      <div
        key={key}
        className={`flex gap-4 p-2 cursor-${isEditable ? "pointer" : "default"}
          ${selectedKey === key ? "bg-yellow-200 dark:bg-yellow-300 dark:text-black" : ""}
          ${isDuplicate ? "bg-red-200" : "bg-gray-200 dark:bg-slate-700"}`}
        onClick={() => (isEditable ? setSelectedKey(key) : null)}
      >
        <div className="w-7/12">{label}</div>
        <div className="w-5/12">{getReadableKeyLabel(i18n, controlKeys?.[key])}</div>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "flex flex-col justify-center items-center border border-gray-200",
        "dark:border-dark-game-content-border",
      )}
    >
      <div className="w-full max-w-3xl">
        {showErrorMessage && (
          <AlertMessage type="error">
            {t({ message: "Duplicate keys detected. Each key must be unique." })}
          </AlertMessage>
        )}

        {showSuccessMessage && (
          <AlertMessage type="success">
            {t({ message: "Your key bindings have been saved successfully!" })}
          </AlertMessage>
        )}
      </div>

      <div className="flex items-evenly gap-6 w-full max-w-5xl pt-2">
        <div className="flex-1 flex flex-col gap-1">
          {renderRow("Move Piece Left", "moveLeft", true)}
          {renderRow("Move Piece Right", "moveRight", true)}
          {renderRow("Cycle Piece Colors", "cycleBlock", true)}
          {renderRow("Drop Piece Quickly", "dropPiece", true)}
          {renderRow("Automatically Use Item", "useItem", true)}

          {Array.from({ length: NUM_TABLE_SEATS }).map((_, index: number) => {
            const keyName: BindingKey = `useItemOnPlayer${index + 1}` as BindingKey;
            return renderRow(i18n._("Use Item on Player {number}", { number: index + 1 }), keyName, true);
          })}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {Array.from({ length: 12 }).map((_, index: number) => {
            const fKey: keyof typeof fKeyMessages = `F${index + 1}` as keyof typeof fKeyMessages;
            return (
              <div key={index} className={clsx("flex gap-4 p-2 bg-gray-200", "dark:bg-slate-700")}>
                <div className="w-1/12">{`F${index + 1}`}</div>
                <div className="w-11/12">{i18n._(fKeyMessages[fKey])}</div>
              </div>
            );
          })}

          <div className="flex flex-col">
            <div className="flex items-evenly gap-2 py-0.5">
              <Button
                type="button"
                className="w-full"
                disabled={!isConnected || isUpdateControlKeysMutating}
                onClick={handleSave}
              >
                {t({ message: "Save" })}
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setShowSuccessMessage(false);
                  setShowErrorMessage(false);
                  onChangeView(TablePanelView.GAME);
                }}
              >
                {t({ message: "Cancel" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
