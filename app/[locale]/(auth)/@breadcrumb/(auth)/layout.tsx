import { PropsWithChildren, ReactNode } from "react";

type BreadcrumbLayoutProps = PropsWithChildren<{}>;

export default function BreadcrumbLayout({ children }: BreadcrumbLayoutProps): ReactNode {
  return <>{children}</>;
}
