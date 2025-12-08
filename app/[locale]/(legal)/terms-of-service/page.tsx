import { ReactNode } from "react";
import { Metadata } from "next";
import { I18n } from "@lingui/core";
import { Trans } from "@lingui/react/macro";
import { initLingui } from "@/app/init-lingui";
import Anchor from "@/components/ui/Anchor";
import { APP_CONFIG } from "@/constants/app";
import { ROUTE_TERMS_OF_SERVICE } from "@/constants/routes";

type TermsOfServiceProps = {
  params: Promise<Params>
};

export async function generateMetadata({ params }: TermsOfServiceProps): Promise<Metadata> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);

  return {
    title: i18n._(ROUTE_TERMS_OF_SERVICE.TITLE),
  };
}

export default async function TermsOfService({ params }: TermsOfServiceProps): Promise<ReactNode> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);
  const name: string = APP_CONFIG.NAME;
  const supportEmail: string = APP_CONFIG.EMAIL.SUPPORT;

  const date: string = i18n.date(new Date("2024/01/01"));

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_TERMS_OF_SERVICE.TITLE)}</h1>
      <Trans>
        <p>Effective Date: {date}</p>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">1. Introduction</h2>
          <p>
            Welcome to {name}! By accessing and using our services, you agree to comply with these Terms of Service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">2. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account details, and you agree not to share
            your account with anyone.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">3. Prohibited Activities</h2>
          <p>
            You agree not to engage in any activity that would harm, disrupt, or interfere with {name} or its users.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">4. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the service if you violate these Terms of
            Service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">5. Limitation of Liability</h2>
          <p>{name} is not responsible for any loss or damage arising from your use of the service.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">6. Contact Us</h2>
          <p>
            If you have any questions, please contact us at{" "}
            <Anchor href={`mailto:${supportEmail}`}>{supportEmail}</Anchor>.
          </p>
        </section>
      </Trans>
    </>
  );
}
