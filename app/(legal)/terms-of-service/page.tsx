import { ReactNode } from "react"
import { Metadata } from "next"
import Anchor from "@/components/ui/Anchor"
import { APP_CONFIG } from "@/constants/app"
import { ROUTE_TERMS_OF_SERVICE } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_TERMS_OF_SERVICE.TITLE,
}

export default function TermsOfService(): ReactNode {
  return (
    <>
      <h1 className="mb-4 text-3xl">{ROUTE_TERMS_OF_SERVICE.TITLE}</h1>
      <p>Effective Date: January 1, 2024</p>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">1. Introduction</h2>
        <p>
          Welcome to {APP_CONFIG.NAME}! By accessing and using our services, you agree to comply with these Terms of
          Service.
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
          You agree not to engage in any activity that would harm, disrupt, or interfere with {APP_CONFIG.NAME} or its
          users.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">4. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the service if you violate these Terms of Service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">5. Limitation of Liability</h2>
        <p>{APP_CONFIG.NAME} is not responsible for any loss or damage arising from your use of the service.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-medium">6. Contact Us</h2>
        <p>
          If you have any questions, please contact us at{" "}
          <Anchor href={`mailto:${APP_CONFIG.EMAIL.SUPPORT}`}>{APP_CONFIG.EMAIL.SUPPORT}</Anchor>.
        </p>
      </section>
    </>
  )
}
