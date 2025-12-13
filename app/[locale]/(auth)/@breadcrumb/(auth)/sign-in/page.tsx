import { ReactNode } from "react";
import { I18n } from "@lingui/core";
import { initLingui } from "@/app/init-lingui";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { ROUTE_HOME, ROUTE_SIGN_IN } from "@/constants/routes";

type BreadcrumbSlotProps = PageProps<"/[locale]/sign-in">;

export default async function BreadcrumbSlot({ params }: BreadcrumbSlotProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href={ROUTE_HOME.PATH}>{i18n._(ROUTE_HOME.TITLE)}</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{i18n._(ROUTE_SIGN_IN.TITLE)}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}
