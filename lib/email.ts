import { User } from "better-auth"
import { emailColors } from "@/components/game/EmailTemplate"
import { APP_CONFIG } from "@/constants/app"

const ctaStyle: string = `display: block; padding: 10px 20px; border: 1px solid ${emailColors.buttonBorder}; border-radius: 8px; background-color: ${emailColors.buttonBackground}; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${emailColors.buttonText}; font-weight: 500; text-align: center; text-decoration: none;`

export const sendEmailVerificationEmail = async (data: { user: User; url: string; token: string }): Promise<void> => {
  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: "Verify your email address",
      html: `
        <p>Hi ${data.user.name},</p>
        <p>We received a request to verify your email address. To proceed, click the following link:<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">Verify email</a><br />If that doesn't work, copy and paste the following link in a browser:<br /><div style="text-align: center;">${data.url}</div><br />The verification token will expire 1 hour after receiving this message.</p>
        <p>If you did not make this request or if you believe your account has been compromised, contact our support team immediately.</p>
      `,
      text: `Hi ${data.user.name},\n\nWe received a request to verify your email address. To proceed, copy and paste the following link in a browser: ${data.url}\n\nThe verification token will expire 1 hour after receiving this message.\n\nIf you did not make this request or if you believe your account has been compromised, contact our support team immediately.\n\n`,
    }),
  })
}

export const sendMagicLinkEmail = async (data: { email: string; token: string; url: string }): Promise<void> => {
  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      subject: `Sign in to ${APP_CONFIG.NAME_SHORT}`,
      html: `
        <p><a href="${data.url}" target="_blank" style="${ctaStyle}">Sign in to ${APP_CONFIG.NAME_SHORT}</a><br /><br />This magic link will expire in 10 minutes.</p>
        <p>If you did not request this email you can safely ignore it.</p>
      `,
      // Email Text body (fallback for email clients that don’t render HTML, e.g. feature phones)
      text: `Hi,\n\nSign in to ${APP_CONFIG.NAME_SHORT}\n${data.url}\n\nThis magic link will expire in 10 minutes.\n\nIf you did not request this email you can safely ignore it.\n\n`,
    }),
  })
}

export const sendPasswordResetEmail = async (data: { user: User; url: string; token: string }): Promise<void> => {
  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: "Password reset request",
      html: `
        <p>Hi ${data.user.name},</p>
        <p>We’ve received a request to reset your password. Reset your password by clicking the following link:<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">Reset password</a><br />If that doesn't work, copy and paste the following link in a browser:<br /><div style="text-align: center;">${data.url}</div><br />The link will expire 1 hour after receiving this message.</p>
        <p>If you did not request a new password or if you believe your account has been compromised, contact our support team immediately.</p>
      `,
      text: `Hi ${data.user.name},\n\nWe’ve received a request to reset your password. Reset your password by copy and paste the following link in a browser: ${data.url}\n\nThe link will expire 1 hour after receiving this message.\n\nIf you did not request a new password or if you believe your account has been compromised, contact our support team immediately.\n\n`,
    }),
  })
}

export const sendEmailChangeEmail = async (data: {
  user: User
  newEmail: string
  url: string
  token: string
}): Promise<void> => {
  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: "Email change request",
      html: `
        <p>Hi ${data.user.name},</p>
        <p>We’ve received an email change request for your account. You’ve entered ${data.newEmail} as the email address for your account. Verify this email address by clicking the following link:<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">Update Email</a><br />If that doesn't work, copy and paste the following link in a browser:<br /><div style="text-align: center;">${data.url}</div><br />The verification token will expire 15 minutes after receiving this message.</p>
        <p>If you did not make this change, your account might have been compromised, contact our support team immediately.</p>
      `,
      text: `Hi ${data.user.name},\n\nWe’ve received an email change request for your account. You’ve entered ${data.newEmail} as the email address for your account. Verify this email address by copy and paste the following link in a browser: ${data.url}\n\nThe verification token will expire 15 minutes after receiving this message.\n\nIf you did not make this change, your account might have been compromised, contact our support team immediately.\n\n`,
    }),
  })
}

export const sendDeleteUserEmail = async (data: { user: User; url: string; token: string }): Promise<void> => {
  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: "Account deletion request received",
      html: `
        <p>Hi ${data.user.name},</p>
        <p>This is to confirm that we have received your request to delete your account associated with the email <strong>${data.user.email}</strong>. Confirm your account deletion by clicking the following link:<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">Delete Account</a><br />If that doesn't work, copy and paste the following link in a browser:<br /><div style="text-align: center;">${data.url}</div><br />Once your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone. Ensure to remove our application from your third-party account settings to fully disconnect your account.</p>
        <p>If you have any questions or need assistance, do not hesitate to reach out.</p>
      `,
      text: `Hi ${data.user.name},\n\nThis is to confirm that we have received your request to delete your account associated with the email ${data.user.email}. Confirm your account deletion by copy and paste the following link in a browser: ${data.url}\n\nOnce your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone. Ensure to remove our application from your third-party account settings to fully disconnect your account.\n\nIf you have any questions or need assistance, do not hesitate to reach out.\n\n`,
    }),
  })
}
