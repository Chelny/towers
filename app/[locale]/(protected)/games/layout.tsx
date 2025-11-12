import { PropsWithChildren, ReactNode } from "react";
import SmallScreenWarning from "@/components/SmallScreenWarning";

type GamesLayoutProps = PropsWithChildren<{}>

export default function GamesLayout({ children }: GamesLayoutProps): ReactNode {
  return (
    <>
      <SmallScreenWarning />
      {children}
    </>
  );
}
