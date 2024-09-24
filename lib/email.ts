import { User } from "@prisma/client"
import axios, { AxiosResponse } from "axios"
import { Resend } from "resend"
import { ROUTE_RESET_PASSWORD, ROUTE_VERIFY_EMAIL } from "@/constants/routes"

const resend: Resend = new Resend(process.env.AUTH_RESEND_KEY)
const brandColor: string = "#346df1"
const color: Record<string, string> = {
  background: "#f9f9f9",
  text: "#444",
  mainBackground: "#fff",
  buttonBackground: brandColor,
  buttonBorder: brandColor,
  buttonText: "#fff"
}

const html = (subject: string, body: string): string => {
  return `
    <body style="background: ${color.background};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0"
        style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center"
            style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            ${subject}
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            ${body}
          </td>
        </tr>
        <tr>
          <td align="center"
            style="padding: 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            Best regards,<br />
            The Team
          </td>
        </tr>
      </table>
    </body>
  `
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
const text = ({ url, host }: { url: string; host: string }): string => {
  return `Sign in to ${host}\n${url}\n\n`
}

type SendVerificationRequestProps = {
  identifier: string
  provider: {
    from: string
    apiKey: string | undefined
  }
  url: string
}

/**
 * Magic link email
 * @param params
 */
export const sendVerificationRequest = async (params: SendVerificationRequestProps): Promise<void> => {
  const { identifier: to, provider, url } = params
  const { host } = new URL(url)
  const escapedHost: string = host.replace(/\./g, "&#8203;.")

  const response: AxiosResponse = await axios({
    method: "POST",
    url: "https://api.resend.com/emails",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json"
    },
    data: {
      from: provider.from,
      to,
      subject: `Sign in to ${host}`,
      html: html(
        `Sign in to <strong>${escapedHost}</strong>`,
        `
          <p><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign in</a></p>
          <p>If you did not request this email you can safely ignore it.</p>
        `
      ),
      text: text({ url, host })
    }
  })

  if (response.status !== 201) {
    throw new Error("Resend error: " + JSON.stringify(response))
  }
}

type SendEmailProps = {
  email: string
  subject: string
  body: string
}

const sendEmail = async ({ email, subject, body }: SendEmailProps): Promise<void> => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: [process.env.EMAIL_TO as string], // TODO: Production: Change to "email"
    subject,
    html: html(subject, body)
  })
}

export const sendVerificationEmail = async (name: string, email: string, token: string): Promise<void> => {
  const encodedEmail: string = encodeURIComponent(email)
  const confirmLink: string = `http://localhost:3000${ROUTE_VERIFY_EMAIL.PATH}?email=${encodedEmail}&token=${token}`

  const body: string = `
    <p>Hi ${name},</p>
    <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the following link: <a href="${confirmLink}" style="color: ${color.link};">confirm email</a> or by copying and pasting the following URL in a browser:</p>

    <p><a href="${confirmLink}" style="color: ${color.link};">${confirmLink}</a></p>

    <p>Please note that the verification token will expire one hour after receiving this message.</p>

    <p>If you did not sign up to our website or if you believe your account has been compromised, please contact our support team immediately.</p>
  `

  await sendEmail({
    email,
    subject: "Confirm Your Email Address to Complete Registration",
    body
  })
}

export const sendPasswordResetEmail = async (name: string, email: string, token: string): Promise<void> => {
  const resetLink: string = `http://localhost:3000${ROUTE_RESET_PASSWORD.PATH}?token=${token}`

  const body: string = `
    <p>Hi ${name},</p>
    <p>We've received a request to reset the password for the account associated with the email ${email}.</p>
    <p>You can reset your password by clicking the following link: <a href="${resetLink}" style="color: ${color.buttonBackground}; text-decoration: none;">reset password</a> or by copy-pasting the following URL in a browser: ${resetLink}. Please note that the link will expire one hour after receiving this message.</p>
    <p>If you did not request a new password or if you believe your account has been compromised, please contact our support team immediately.</p>
    <p>If you did not request this email, you can safely ignore it.</p>
  `

  await sendEmail({
    email,
    subject: "Password Reset Request",
    body
  })
}

export const sendAccountDeletionEmail = async (
  user: Pick<User, "name" | "email" | "deletionScheduledAt">
): Promise<void> => {
  const localizedDate: string | undefined = user.deletionScheduledAt?.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  const body: string = `
    <p>Hi ${user.name},</p>
    <p>This is to confirm that we have received your request to delete your account associated with the email ${user.email}.</p>
    <p>Your account is scheduled for deletion on <strong>${localizedDate} UTC</strong>. If you did not request this or wish to retain your account, please contact our support team before this date.</p>
    <p>After your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone.</p>
    <p>Please ensure to remove our application from your third-party account settings to fully disconnect your account.</p>
    <p>If you have any questions or need assistance, please do not hesitate to reach out.</p>
  `

  await sendEmail({
    email: user.email,
    subject: "Account Deletion Request Received",
    body
  })
}
