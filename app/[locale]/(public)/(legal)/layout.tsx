import { ReactNode } from "react";
import Image from "next/image";
import { APP_CONFIG } from "@/constants/app";

type LegalLayoutProps = LayoutProps<"/[locale]">;

export default function LegalLayout({ children }: LegalLayoutProps): ReactNode {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 p-4 bg-youpi-primary">
        <Image src="/favicon.svg" width={36} height={24} alt={APP_CONFIG.NAME} />
        <h1 className="font-semibold text-white text-4xl">{APP_CONFIG.NAME}</h1>
      </div>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
