"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { Session } from "@/lib/auth-client";
import { UserPlainObject } from "@/server/towers/classes/User";

type UserAvatarProps = {
  user?: Session["user"] | UserPlainObject
  isLoading?: boolean
  className?: string
  dimensions?: string
  size?: number
};

export default function UserAvatar({
  user,
  isLoading,
  className,
  dimensions = "w-10 h-10",
  size = 40,
}: UserAvatarProps): ReactNode {
  const { t } = useLingui();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const placeholderSrc: string = "https://placehold.co/40x40.png?text=?";
  const placeholderAlt: string = t({ message: "Avatar placeholder" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={clsx("flex rounded-md bg-zinc-400", dimensions, className)}>
        <Image
          className="rounded-md"
          src={placeholderSrc}
          width={size}
          height={size}
          priority={true}
          alt={placeholderAlt}
        />
      </div>
    );
  }

  const username: string | null | undefined = user?.username;
  const imageSrc: string = user?.image || placeholderSrc;
  const imageAlt: string = user?.image ? t({ message: `${username}’s avatar` }) : placeholderAlt;

  if (isLoading || !user) {
    return (
      <div className={clsx("flex rounded-md bg-zinc-400", dimensions, className)}>
        <Image
          className="rounded-md"
          src={placeholderSrc}
          width={size}
          height={size}
          priority={true}
          alt={placeholderAlt}
        />
      </div>
    );
  }

  return (
    <div className={clsx("flex rounded-md bg-zinc-400", dimensions, className)}>
      <Image
        className="rounded-md"
        src={imageSrc}
        width={size}
        height={size}
        priority={true}
        alt={imageAlt}
        data-testid="user-avatar_image"
      />
    </div>
  );
}
