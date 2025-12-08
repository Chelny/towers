import { ReactNode } from "react";
import { Metadata } from "next";
import { I18n } from "@lingui/core";
import { Trans } from "@lingui/react/macro";
import { initLingui } from "@/app/init-lingui";
import Anchor from "@/components/ui/Anchor";
import { APP_CONFIG } from "@/constants/app";
import { ROUTE_DELETE_ACCOUNT, ROUTE_PRIVACY_POLICY } from "@/constants/routes";

type PrivacyPolicyProps = {
  params: Promise<Params>
};

export async function generateMetadata({ params }: PrivacyPolicyProps): Promise<Metadata> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);

  return {
    title: i18n._(ROUTE_PRIVACY_POLICY.TITLE),
  };
}

export default async function PrivacyPolicy({ params }: PrivacyPolicyProps): Promise<ReactNode> {
  const routeParams: Params = await params;
  const i18n: I18n = initLingui(routeParams.locale);
  const name: string = APP_CONFIG.NAME;
  const supportEmail: string = APP_CONFIG.EMAIL.SUPPORT;

  const date: string = i18n.date(new Date("2024/01/01"));

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_PRIVACY_POLICY.TITLE)}</h1>
      <Trans>
        <p>Effective Date: {date}</p>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">1. Introduction</h2>
          <p>
            This Privacy Policy explains how {name} collects, uses, and protects your personal data when you use our
            services.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">2. Information We Collect</h2>
          <p>When you sign up and use {name}, we collect the following personal information:</p>
          <ul className="list-inside list-disc ms-8">
            <li>
              <strong>Name:</strong> Your full name.
            </li>
            <li>
              <strong>Email:</strong> Your email address.
            </li>
            <li>
              <strong>Birthdate:</strong> Your date of birth.
            </li>
            <li>
              <strong>Usage Data:</strong> Data related to your usage of the services.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">3. How We Use Your Information</h2>
          <p>
            We use your information to provide and improve the services, communicate with you, and for security
            purposes.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">4. Sharing Your Information</h2>
          <p>
            We do not sell or share your personal information with third parties except as required by law or with your
            consent.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">5. Security</h2>
          <p>
            We implement reasonable security measures to protect your data, but no method of transmission over the
            Internet is 100% secure.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To delete your account, please sign in
            and visit the <Anchor href={ROUTE_DELETE_ACCOUNT.PATH}>account deletion page</Anchor>.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">7. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted here with an updated
            &ldquo;Effective Date.&rdquo;
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-medium">8. Contact Us</h2>
          <p>
            If you have any questions, please contact us at{" "}
            <Anchor href={`mailto:${supportEmail}`}>{supportEmail}</Anchor>.
          </p>
        </section>
      </Trans>
    </>
  );
}
