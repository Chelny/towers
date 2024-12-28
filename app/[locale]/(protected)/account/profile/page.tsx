import { ReactNode, Suspense } from "react"
import { Metadata } from "next"
import { headers } from "next/headers"
import { I18n } from "@lingui/core"
import clsx from "clsx/lite"
import { ChangeEmailForm } from "@/app/[locale]/(protected)/account/profile/change-email.form"
import { ChangePasswordForm } from "@/app/[locale]/(protected)/account/profile/change-password.form"
import { LinkedSocialAccountsForm } from "@/app/[locale]/(protected)/account/profile/linked-social-accounts.form"
import { PasskeysForm } from "@/app/[locale]/(protected)/account/profile/passkeys.form"
import { ProfileForm } from "@/app/[locale]/(protected)/account/profile/profile.form"
import { initLingui } from "@/app/init-lingui"
import ChangeEmailFormSkeleton from "@/components/skeleton/ChangeEmailFormSkeleton"
import ChangePasswordFormSkeleton from "@/components/skeleton/ChangePasswordFormSkeleton"
import LinkedSocialAccountsFormSkeleton from "@/components/skeleton/LinkedSocialAccountsFormSkeleton"
import PasskeysFormSkeleton from "@/components/skeleton/PasskeysFormSkeleton"
import ProfileFormSkeleton from "@/components/skeleton/ProfileFormSkeleton"
import { ROUTE_PROFILE } from "@/constants/routes"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"

type ProfileProps = {
  params: Promise<Params>
}

export async function generateMetadata({ params }: ProfileProps): Promise<Metadata> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return {
    title: i18n._(ROUTE_PROFILE.TITLE),
  }
}

export default async function Profile({ params }: ProfileProps): Promise<ReactNode> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)
  const session: Session | null = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_PROFILE.TITLE)}</h1>
      <div
        className={clsx(
          "flex flex-col gap-6",
          "md:grid md:grid-cols-6 md:grid-rows-[auto,auto,auto] md:gap-4",
          "lg:grid-cols-6 lg:grid-rows-[auto,auto,auto] lg:gap-8",
        )}
      >
        {/* Profile */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50",
            "md:col-span-3",
            "lg:col-span-4",
          )}
        >
          <Suspense fallback={<ProfileFormSkeleton />}>
            <ProfileForm session={session} />
          </Suspense>
        </section>

        {/* Linked Socials */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50",
            "md:col-span-3",
            "lg:col-span-2",
          )}
        >
          <Suspense fallback={<LinkedSocialAccountsFormSkeleton />}>
            <LinkedSocialAccountsForm />
          </Suspense>
        </section>

        {/* Change Email */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50",
            "md:col-span-2",
            "lg:col-span-2",
          )}
        >
          <Suspense fallback={<ChangeEmailFormSkeleton />}>
            <ChangeEmailForm session={session} />
          </Suspense>
        </section>

        {/* Change Password */}
        <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50",
            "md:col-span-2",
            "lg:col-span-2",
          )}
        >
          <Suspense fallback={<ChangePasswordFormSkeleton />}>
            <ChangePasswordForm session={session} />
          </Suspense>
        </section>

        {/* Passkeys */}
        {/* <section
          className={clsx(
            "p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50",
            "md:col-span-2",
            "lg:col-span-2",
          )}
        >
          <Suspense fallback={<PasskeysFormSkeleton />}>
            <PasskeysForm />
          </Suspense>
        </section> */}
      </div>
    </>
  )
}
