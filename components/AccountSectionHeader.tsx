import { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx/lite";

type AccountSectionHeaderProps = PropsWithChildren<{
  title: ReactNode
  description?: ReactNode
  isNewUser?: boolean
}>;

export default function AccountSectionHeader({
  children,
  title,
  description,
  isNewUser,
}: AccountSectionHeaderProps): ReactNode {
  return (
    <div className={clsx(isNewUser ? "" : "grid lg:grid-cols-[350px_1fr] gap-4")}>
      <div className={clsx(isNewUser && "hidden")}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className={clsx("text-gray-500", "dark:text-dark-text-muted")}>{description}</p>}
      </div>
      {children}
    </div>
  );
}
