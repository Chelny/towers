import { ReactNode } from "react";
import { Metadata } from "next/types";
import { I18n } from "@lingui/core";
import { SignInForm } from "@/app/[locale]/(public)/(auth)/sign-in/sign-in.form";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_SIGN_IN } from "@/constants/routes";

type SignInProps = PageProps<"/[locale]/sign-in">;

export async function generateMetadata({ params }: SignInProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_SIGN_IN.TITLE),
  };
}

export default async function SignIn({ params }: SignInProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_SIGN_IN.TITLE)}</h1>
      <SignInForm />
    </>
  );
}
