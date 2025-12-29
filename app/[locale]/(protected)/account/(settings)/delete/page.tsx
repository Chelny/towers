import { ReactNode } from "react";
import { Metadata } from "next";
import { I18n } from "@lingui/core";
import { DeleteAccountForm } from "@/app/[locale]/(protected)/account/(settings)/delete/delete.form";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_DELETE_ACCOUNT } from "@/constants/routes";

type DeleteAccountProps = PageProps<"/[locale]/account/delete">;

export async function generateMetadata({ params }: DeleteAccountProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_DELETE_ACCOUNT.TITLE),
  };
}

export default async function DeleteAccount({ params }: DeleteAccountProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return (
    <>
      <h1 className="text-2xl">{i18n._(ROUTE_DELETE_ACCOUNT.TITLE)}</h1>
      <DeleteAccountForm />
    </>
  );
}
