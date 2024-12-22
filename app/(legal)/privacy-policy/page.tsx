import { ReactNode } from "react"
import { Metadata } from "next"
import Anchor from "@/components/ui/Anchor"
import { APP_CONFIG } from "@/constants/app"
import { ROUTE_DELETE_ACCOUNT, ROUTE_PRIVACY_POLICY } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_PRIVACY_POLICY.TITLE,
}

export default function PrivacyPolicy(): ReactNode {
  return (
    <>
      <h1 className="mb-4 text-3xl">{ROUTE_PRIVACY_POLICY.TITLE}</h1>
      <p>Effective Date: January 1, 2024</p>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">1. Introduction</h2>
        <p>
          This Privacy Policy explains how {APP_CONFIG.NAME} collects, uses, and protects your personal data when you
          use our services.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">2. Information We Collect</h2>
        <p>When you sign up and use {APP_CONFIG.NAME}, we collect the following personal information:</p>
        <ul className="list-inside list-disc ml-8">
          <li>
            <strong>Name:</strong> Your full name.
          </li>
          <li>
            <strong>Email:</strong> Your email address.
          </li>
          <li>
            <strong>Birthdate:</strong> Your date of birth (optional).
          </li>
          <li>
            <strong>Usage Data:</strong> Data related to your usage of the services.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">3. How We Use Your Information</h2>
        <p>
          We use your information to provide and improve the services, communicate with you, and for security purposes.
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
          <Anchor href={`mailto:${APP_CONFIG.EMAIL.SUPPORT}`}>{APP_CONFIG.EMAIL.SUPPORT}</Anchor>.
        </p>
      </section>
    </>
  )
}
