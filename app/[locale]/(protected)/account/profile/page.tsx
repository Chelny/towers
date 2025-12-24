import { ReactNode, Suspense } from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { I18n } from "@lingui/core";
import clsx from "clsx/lite";
import { ChangeEmailForm } from "@/app/[locale]/(protected)/account/profile/change-email.form";
import { ChangePasswordForm } from "@/app/[locale]/(protected)/account/profile/change-password.form";
import { LinkedSocialAccountsForm } from "@/app/[locale]/(protected)/account/profile/linked-social-accounts.form";
import { PasskeysForm } from "@/app/[locale]/(protected)/account/profile/passkeys.form";
import { PersonalInformationForm } from "@/app/[locale]/(protected)/account/profile/personal-information.form";
import { initLingui } from "@/app/init-lingui";
import ChangeEmailFormSkeleton from "@/components/skeleton/ChangeEmailFormSkeleton";
import ChangePasswordFormSkeleton from "@/components/skeleton/ChangePasswordFormSkeleton";
import LinkedSocialAccountsFormSkeleton from "@/components/skeleton/LinkedSocialAccountsFormSkeleton";
import PasskeysFormSkeleton from "@/components/skeleton/PasskeysFormSkeleton";
import PersonalInformationFormSkeleton from "@/components/skeleton/PersonalInformationFormSkeleton";
import { ROUTE_PROFILE } from "@/constants/routes";
import { auth } from "@/lib/auth";
import { Session } from "@/lib/auth-client";

type ProfileProps = PageProps<"/[locale]/account/profile">;

export async function generateMetadata({ params }: ProfileProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return {
    title: i18n._(ROUTE_PROFILE.TITLE),
  };
}

export default async function Profile({ params }: ProfileProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);
  const session: Session | null = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_PROFILE.TITLE)}</h1>
      <div className="flex flex-col gap-6">
        {/* Personal Information */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
        >
          <Suspense fallback={<PersonalInformationFormSkeleton />}>
            <PersonalInformationForm session={session} />
          </Suspense>
        </section>

        {/* Email */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
        >
          <Suspense fallback={<ChangeEmailFormSkeleton />}>
            <ChangeEmailForm session={session} />
          </Suspense>
        </section>

        {/* Password */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
        >
          <Suspense fallback={<ChangePasswordFormSkeleton />}>
            <ChangePasswordForm session={session} />
          </Suspense>
        </section>

        {/* Linked Socials */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
        >
          <Suspense fallback={<LinkedSocialAccountsFormSkeleton />}>
            <LinkedSocialAccountsForm />
          </Suspense>
        </section>

        {/* Passkeys */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-xs bg-gray-50",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
        >
          <Suspense fallback={<PasskeysFormSkeleton />}>
            <PasskeysForm />
          </Suspense>
        </section>
      </div>
    </>
  );
}
