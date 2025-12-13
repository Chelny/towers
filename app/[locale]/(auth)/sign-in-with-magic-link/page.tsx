import { ReactNode } from "react";
import { Metadata } from "next/types";
import { I18n } from "@lingui/core";
import { SignInWithMagicLinkForm } from "@/app/[locale]/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.form";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_SIGN_IN_WITH_MAGIC_LINK } from "@/constants/routes";

type SignInWithMagicLinkProps = PageProps<"/[locale]/sign-in-with-magic-link">;

export async function generateMetadata({ params }: SignInWithMagicLinkProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_SIGN_IN_WITH_MAGIC_LINK.TITLE),
  };
}

export default async function SignInWithMagicLink({ params }: SignInWithMagicLinkProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_SIGN_IN_WITH_MAGIC_LINK.TITLE)}</h1>
      <SignInWithMagicLinkForm />
    </>
  );
}
