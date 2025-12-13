import { ReactNode } from "react";
import SmallScreenWarning from "@/components/SmallScreenWarning";

type GamesLayoutProps = LayoutProps<"/[locale]/games">;

export default function GamesLayout({ children }: GamesLayoutProps): ReactNode {
  return (
    <>
      <SmallScreenWarning />
      {children}
    </>
  );
}
