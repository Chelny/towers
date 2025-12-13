import { ReactNode, Suspense } from "react";
import { Metadata } from "next/types";
import { I18n } from "@lingui/core";
import { ResetPasswordForm } from "@/app/[locale]/(auth)/reset-password/reset-password.form";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_RESET_PASSWORD } from "@/constants/routes";

type ResetPasswordProps = PageProps<"/[locale]/reset-password">;

export async function generateMetadata({ params }: ResetPasswordProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_RESET_PASSWORD.TITLE),
  };
}

export default async function ResetPassword({ params }: ResetPasswordProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_RESET_PASSWORD.TITLE)}</h1>
      <ResetPasswordFormSection />
    </>
  );
}

function ResetPasswordFormSection(): ReactNode {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
