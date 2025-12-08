import { i18n, I18n } from "@lingui/core";
import { User as BetterAuthUser } from "better-auth";
import { initLingui } from "@/app/init-lingui";
import { APP_CONFIG } from "@/constants/app";
import { EMAIL_COLORS } from "@/constants/email";

const ctaStyle: string = `display: block; padding: 10px 20px; border: 1px solid ${EMAIL_COLORS.buttonBorder}; border-radius: 8px; background-color: ${EMAIL_COLORS.buttonBackground}; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${EMAIL_COLORS.buttonText}; font-weight: 500; text-align: center; text-decoration: none;`;

export const sendEmailVerificationEmail = async (data: {
  user: BetterAuthUser
  url: string
  token: string
}): Promise<void> => {
  // @ts-ignore
  const i18n: I18n = initLingui(data.user.language);

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: i18n._("Verify your email address"),
      html: `
        <p>${i18n._("Hi {name},", { name: data.user.name })}</p>
        <p>${i18n._("We received a request to verify your email address. To proceed, click the following link:")}<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">${i18n._("Verify email")}</a><br />${i18n._("If that doesn't work, copy and paste the following link in a browser:")}<br /><div style="text-align: center;">${data.url}</div><br />${i18n._(
          "The verification token will expire 1 hour after receiving this message.",
        )}</p>
        <p>${i18n._("If you did not make this request or if you believe your account has been compromised, contact our support team immediately.")}</p>
      `,
      text: i18n._(
        "Hi {name},\n\nWe received a request to verify your email address. To proceed, copy and paste the following link in a browser: {url}\n\nThe verification token will expire 1 hour after receiving this message.\n\nIf you did not make this request or if you believe your account has been compromised, contact our support team immediately.\n\n",
        { name: data.user.name, url: data.url },
      ),
      // @ts-ignore
      locale: data.user.language,
    }),
  });
};

export const sendMagicLinkEmail = async (data: { email: string; token: string; url: string }): Promise<void> => {
  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      subject: i18n._("Sign in to {appName}", { appName: APP_CONFIG.NAME }),
      html: `
        <p><a href="${data.url}" target="_blank" style="${ctaStyle}">${i18n._("Sign in to {appName}", { appName: APP_CONFIG.NAME })}</a><br /><br />${i18n._("This magic link will expire in 10 minutes.")}</p>
        <p>${i18n._("If you did not request this email you can safely ignore it.")}</p>
      `,
      // Email Text body (fallback for email clients that don’t render HTML, e.g. feature phones)
      text: i18n._(
        "Hi,\n\nSign in to {appName}\n{url}\n\nThis magic link will expire in 10 minutes.\n\nIf you did not request this email you can safely ignore it.\n\n",
        { appName: APP_CONFIG.NAME, url: data.url },
      ),
    }),
  });
};

export const sendPasswordResetEmail = async (data: {
  user: BetterAuthUser
  url: string
  token: string
}): Promise<void> => {
  // @ts-ignore
  const i18n: I18n = initLingui(data.user.language);

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: i18n._("Password reset request"),
      html: `
        <p>${i18n._("Hi {name},", { name: data.user.name })}</p>
        <p>${i18n._("We’ve received a request to reset your password. Reset your password by clicking the following link:")}<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">${i18n._("Reset password")}</a><br />${i18n._("If that doesn't work, copy and paste the following link in a browser:")}<br /><div style="text-align: center;">${data.url}</div><br />${i18n._("The link will expire 1 hour after receiving this message.")}</p>
        <p>${i18n._("If you did not request a new password or if you believe your account has been compromised, contact our support team immediately.")}</p>
      `,
      text: i18n._(
        "Hi {name},\n\nWe’ve received a request to reset your password. Reset your password by copying and pasting the following link in a browser: {url}\n\nThe link will expire 1 hour after receiving this message.\n\nIf you did not request a new password or if you believe your account has been compromised, contact our support team immediately.\n\n",
        { name: data.user.name, url: data.url },
      ),
      // @ts-ignore
      locale: data.user.language,
    }),
  });
};

export const sendEmailChangeEmail = async (data: {
  user: BetterAuthUser
  newEmail: string
  url: string
  token: string
}): Promise<void> => {
  // @ts-ignore
  const i18n: I18n = initLingui(data.user.language);

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: i18n._("Email change request"),
      html: `
        <p>${i18n._("Hi {name},", { name: data.user.name })}</p>
        <p>${i18n._("We’ve received an email change request for your account. You’ve entered {newEmail} as the email address for your account. Verify this email address by clicking the following link:", { newEmail: data.newEmail })}<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">${i18n._("Update Email")}</a><br />${i18n._("If that doesn't work, copy and paste the following link in a browser:")}<br /><div style="text-align: center;">${data.url}</div><br />${i18n._("The verification token will expire 15 minutes after receiving this message.")}</p>
        <p>${i18n._("If you did not make this change, your account might have been compromised, contact our support team immediately.")}</p>
      `,
      text: i18n._(
        "Hi {name},\n\nWe’ve received an email change request for your account. You’ve entered {newEmail} as the email address for your account. Verify this email address by copying and pasting the following link in a browser: {url}\n\nThe verification token will expire 15 minutes after receiving this message.\n\nIf you did not make this change, your account might have been compromised, contact our support team immediately.\n\n",
        { name: data.user.name, newEmail: data.newEmail, url: data.url },
      ),
    }),
  });
};

export const sendDeleteUserEmail = async (data: {
  user: BetterAuthUser
  url: string
  token: string
}): Promise<void> => {
  // @ts-ignore
  const i18n: I18n = initLingui(data.user.language);

  await fetch(`${process.env.BASE_URL}/api/send`, {
    method: "POST",
    body: JSON.stringify({
      email: data.user.email,
      subject: i18n._("Account deletion request received"),
      html: `
        <p>${i18n._("Hi {name},", { name: data.user.name })}</p>
        <p>${i18n._("This is to confirm that we have received your request to delete your account associated with the email <strong>{email}</strong>. Confirm your account deletion by clicking the following link:", { email: data.user.email })}<br /><br /><a href="${data.url}" target="_blank" style="${ctaStyle}">${i18n._("Delete Account")}</a><br />${i18n._("If that doesn't work, copy and paste the following link in a browser:")}<br /><div style="text-align: center;">${data.url}</div><br />${i18n._("Once your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone. Ensure to remove our application from your third-party account settings to fully disconnect your account.")}</p>
        <p>${i18n._("If you have any questions or need assistance, do not hesitate to reach out.")}</p>
      `,
      text: i18n._(
        "Hi {name},\n\nThis is to confirm that we have received your request to delete your account associated with the email {email}. Confirm your account deletion by copying and pasting the following link in a browser: {url}\n\nOnce your account is deleted, all your data will be permanently removed from our system, and this action cannot be undone. Ensure to remove our application from your third-party account settings to fully disconnect your account.\n\nIf you have any questions or need assistance, do not hesitate to reach out.\n\n",
        { name: data.user.name, email: data.user.email, url: data.url },
      ),
    }),
  });
};
