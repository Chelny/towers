import { ReactNode } from "react";

type BreadcrumbLayoutProps = LayoutProps<"/[locale]">;

export default function BreadcrumbLayout({ children }: BreadcrumbLayoutProps): ReactNode {
  return <>{children}</>;
}
