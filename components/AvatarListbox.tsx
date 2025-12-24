"use client";

import { KeyboardEvent, ReactNode, useState } from "react";
import Image from "next/image";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { Avatar, AVATARS } from "@/constants/avatars";
import { useAvatarSave } from "@/hooks/useAvatarSave";

type AvatarListboxProps = {
  initialAvatarId: string
};

export function AvatarListbox({ initialAvatarId = AVATARS[0].id }: AvatarListboxProps): ReactNode {
  const { t } = useLingui();
  const { saveAvatarDebounced } = useAvatarSave();
  const [value, setValue] = useState<string>(initialAvatarId);

  const handleSelectAvatar = (id: string): void => {
    setValue(id);
    saveAvatarDebounced(id);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const idx: number = AVATARS.findIndex((avatar: Avatar) => avatar.id === value);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next: string = AVATARS[(idx + 1) % AVATARS.length]?.id;
      handleSelectAvatar(next);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev: string = AVATARS[(idx - 1 + AVATARS.length) % AVATARS.length]?.id;
      handleSelectAvatar(prev);
    }
  };

  return (
    <div>
      <h5>{t({ message: "Avatars:" })}</h5>
      <div
        className={clsx(
          "grid gap-1 overflow-x-scroll h-38 py-1.5 border border-gray-400 rounded bg-gray-100",
          "dark:border-slate-500 dark:bg-slate-700",
        )}
        role="listbox"
        tabIndex={0}
        aria-label={t({ message: "Avatars" })}
        onKeyDown={onKeyDown}
      >
        {AVATARS.map((avatar: Avatar) => {
          const isSelectedAvatar: boolean = avatar.id === value;
          return (
            <button
              key={avatar.id}
              type="button"
              className={clsx(
                "flex justify-center gap-2 px-4 py-1",
                isSelectedAvatar ? "bg-gray-300 dark:bg-slate-500" : "bg-transparent",
              )}
              role="option"
              aria-selected={isSelectedAvatar}
              onClick={() => handleSelectAvatar(avatar.id)}
            >
              <Image src={avatar.src} className="rtl:-scale-x-100" width={32} height={32} alt={avatar.label} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
