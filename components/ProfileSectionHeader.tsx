import { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx/lite";

type ProfileSectionHeaderProps = PropsWithChildren<{
  title: ReactNode
  description?: ReactNode
  isNewUser?: boolean
}>;

export default function ProfileSectionHeader({
  children,
  title,
  description,
  isNewUser,
}: ProfileSectionHeaderProps): ReactNode {
  return (
    <div className={clsx(isNewUser ? "" : "grid lg:grid-cols-[350px_1fr] gap-4")}>
      <div className={clsx(isNewUser && "hidden")}>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className={clsx("text-gray-500", "dark:text-dark-text-muted")}>{description}</p>}
      </div>
      {children}
    </div>
  );
}
