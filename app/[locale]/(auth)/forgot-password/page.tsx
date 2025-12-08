import { ReactNode } from "react";
import { Metadata } from "next/types";
import { I18n } from "@lingui/core";
import { ForgotPasswordForm } from "@/app/[locale]/(auth)/forgot-password/forgot-password.form";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_FORGOT_PASSWORD } from "@/constants/routes";

type ForgotPasswordProps = {
  params: Promise<Params>
};

export async function generateMetadata({ params }: ForgotPasswordProps): Promise<Metadata> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);

  return {
    title: i18n._(ROUTE_FORGOT_PASSWORD.TITLE),
  };
}

export default async function ForgotPassword({ params }: ForgotPasswordProps): Promise<ReactNode> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_FORGOT_PASSWORD.TITLE)}</h1>
      <ForgotPasswordForm />
    </>
  );
}
