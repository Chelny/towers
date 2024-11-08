import { User } from "@prisma/client"
import EmailTemplate, { emailColors } from "@/components/game/EmailTemplate"
import { ROUTE_CONFIRM_EMAIL_CHANGE, ROUTE_RESET_PASSWORD, ROUTE_VERIFY_EMAIL } from "@/constants/routes"

type SendVerificationRequestProps = {
  identifier: string
  provider: {
    from: string | undefined
    apiKey: string | undefined
  }
  url: string
}

const ctaStyle: string = `display: block; padding: 10px 20px; border: 1px solid ${emailColors.buttonBorder}; border-radius: 8px; background-color: ${emailColors.buttonBackground}; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${emailColors.buttonText}; font-weight: 600; text-align: center; text-decoration: none;`

/**
 * Magic link email
 */
export const sendVerificationRequest = async (props: SendVerificationRequestProps): Promise<void> => {
  const { identifier: to, provider, url } = props
  const { host } = new URL(url)

  try {
    const response: Response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        from: provider.from,
        to,
        subject: `Sign in to ${host}`,
        react: EmailTemplate({
          html: `
            <p><a href="${url}" target="_blank" style="${ctaStyle}">Sign in</a></p>
            <p>If you did not request this email you can safely ignore it.</p>
          `,
        }),
        // Email Text body (fallback for email clients that don’t render HTML, e.g. feature phones)
        text: `Hi,\n\nSign in to ${host}\n${url}\n\nIf you did not request this email you can safely ignore it.\n\n`,
      }),
    })

    if (!response.ok) {
      const errorData: ApiResponse = await response.json()
      throw new Error(errorData?.message)
    }
  } catch (error) {
    console.error(error)
  }
}

export const sendVerificationEmail = async (name: string, email: string, token: string): Promise<void> => {
  const verificationLink: string = `${process.env.BASE_URL}${ROUTE_VERIFY_EMAIL.PATH}?token=${token}`

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email,
      subject: "Verify Your Email Address to Complete Registration",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for signing up! To complete your registration, verify your email address by clicking the following link:<br /><br /><a href="${verificationLink}" target="_blank" style="${ctaStyle}">Verify email</a><br />If that doesn't work, copy and paste the following link in a browser:<br /><div style="text-align: center;">${verificationLink}</div><br />The verification token will expire 1 hour after receiving this message.</p>
        <p>If you did not sign up to our website or if you believe your account has been compromised, contact our support team immediately.</p>
      `,
      text: `Hi ${name},\n\nThank you for signing up! To complete your registration, verify your email address by copy and paste the following link in a browser: ${verificationLink}\n\nThe verification token will expire 1 hour after receiving this message.\n\nIf you did not sign up to our website or if you believe your account has been compromised, contact our support team immediately.\n\n`,
    }),
  })
}

export const sendPasswordResetEmail = async (name: string, email: string, token: string): Promise<void> => {
  const resetLink: string = `${process.env.BASE_URL}${ROUTE_RESET_PASSWORD.PATH}?token=${token}`

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${name},</p>
        <p>We’ve received a request to reset the password for the account associated with the email ${email}. You can reset your password by clicking the following link:<br /><br /><a href="${resetLink}" target="_blank" style="${ctaStyle}">Reset password</a><br />If that doesn't work, copy and paste the following link in a browser:<br /><div style="text-align: center;">${resetLink}</div><br />The link will expire one hour after receiving this message.</p>
        <p>If you did not request a new password or if you believe your account has been compromised, contact our support team immediately.</p>
      `,
      text: `Hi ${name},\n\nWe’ve received a request to reset the password for the account associated with the email ${email}. You can reset your password by copy and paste the following link in a browser: ${resetLink}\n\nThe link will expire one hour after receiving this message.\n\nIf you did not request a new password or if you believe your account has been compromised, contact our support team immediately.\n\n`,
    }),
  })
}

export const sendEmailChangeEmail = async (name: string, email: string, token: string): Promise<void> => {
  const verificationLink: string = `${process.env.BASE_URL}${ROUTE_CONFIRM_EMAIL_CHANGE.PATH}?token=${token}`

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email,
      subject: "Verify Your Email Address Change Request",
      html: `
        <p>Hi ${name},</p>
        <p>We’ve received an email change request for your account. You’ve entered ${email} as the email address for your account. Verify this email address by clicking the following link:<br /><br /><a href="${verificationLink}" target="_blank" style="${ctaStyle}">Update Email</a><br />The verification token will expire 15 minutes after receiving this message.</p>
        <p>If you did not make this change, your account might have been compromised, contact our support team immediately.</p>
      `,
      text: `Hi ${name},\n\nWe’ve received an email change request for your account. You’ve entered ${email} as the email address for your account. Verify this email address by copy and paste the following link in a browser: ${verificationLink}\n\nThe verification token will expire 15 minutes after receiving this message.\n\nIf you did not make this change, your account might have been compromised, contact our support team immediately.\n\n`,
    }),
  })
}

export const sendAccountDeletionEmail = async (
  user: Pick<User, "name" | "email" | "deletionScheduledAt">,
): Promise<void> => {
  const localizedDate: string | undefined = user.deletionScheduledAt?.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      subject: "Account Deletion Request Received",
      body: `
        <p>Hi ${user.name},</p>
        <p>This is to confirm that we have received your request to delete your account associated with the email <strong>${user.email}</strong>. Your account is scheduled for deletion on <strong>${localizedDate} UTC</strong>. If you did not request this or wish to retain your account, contact our support team before this date. After your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone. Ensure to remove our application from your third-party account settings to fully disconnect your account.</p>
        <p>If you have any questions or need assistance, do not hesitate to reach out.</p>
      `,
      text: `Hi ${user.name},\n\nThis is to confirm that we have received your request to delete your account associated with the email ${user.email}. Your account is scheduled for deletion on ${localizedDate} UTC. If you did not request this or wish to retain your account, contact our support team before this date. After your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone. Ensure to remove our application from your third-party account settings to fully disconnect your account.\n\nIf you have any questions or need assistance, do not hesitate to reach out.\n\n`,
    }),
  })
}
