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
import { ROUTE_FORGOT_PASSWORD, ROUTE_HOME, ROUTE_RESET_PASSWORD } from "@/constants/routes";

type BreadcrumbSlotProps = PageProps<"/[locale]/reset-password">;

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
        <BreadcrumbLink href={ROUTE_FORGOT_PASSWORD.PATH}>{i18n._(ROUTE_FORGOT_PASSWORD.TITLE)}</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{i18n._(ROUTE_RESET_PASSWORD.TITLE)}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}
