import { Resend } from "resend"
import { ROUTE_RESET_PASSWORD, ROUTE_VERIFY_EMAIL } from "@/constants"

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

export const sendVerificationEmail = async (name: string, email: string, token: string): Promise<void> => {
  const encodedEmail: string = encodeURIComponent(email)
  const confirmLink: string = `http://localhost:3000${ROUTE_VERIFY_EMAIL.PATH}?email=${encodedEmail}&token=${token}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: [process.env.EMAIL_TO as string], // TODO: Production: Change to "email"
    subject: "Confirm Your Email Address to Complete Registration",
    html: `
      <body style="background: ${color.background};">
        <table width="100%" border="0" cellspacing="20" cellpadding="0"
          style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
          <tr>
            <td align="center"
              style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
              Welcome to Our Service!
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
              <p>
                Hello ${name},<br />
                <br />
                Thank you for signing up! To complete your registration, please verify your email address by clicking the
                following link: <a href="${confirmLink}" style="color: ${color.link};">confirm email</a> or by copying and pasting the following URL in a browser: <br />
                <a href="${confirmLink}" style="color: ${color.link};">${confirmLink}</a>.
                <br />
                <br />
                Please note that the verification token will expire one hour after receiving this message.
                <br />
                <br />
                If you did not sign up to our website or if you believe your account has been compromised, please contact our
                support team immediately.
              </p>
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
  })
}

export const sendPasswordResetEmail = async (name: string, email: string, token: string): Promise<void> => {
  const resetLink: string = `http://localhost:3000${ROUTE_RESET_PASSWORD.PATH}?token=${token}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: [process.env.EMAIL_TO as string], // TODO: Production: Change to "email"
    subject: "Password Reset Request",
    html: `
      <body style="background: ${color.background};">
        <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
              Password Reset Request
            </td>
          </tr>
          <tr>
            <td align="left" style="padding: 20px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
              <p>Hi ${name},</p>
              <p>We've received a request to reset the password for the account associated with the email ${email}.</p>
              <p>You can reset your password by clicking the following link: <a href="${resetLink}" style="color: ${color.buttonBackground}; text-decoration: none;">reset password</a> or by copy-pasting the following URL in a browser: ${resetLink}. Please note that the link will expire one hour after receiving this message.</p>
              <p>If you did not request a new password or if you believe your account has been compromised, please contact our support team immediately.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                    <a href="${resetLink}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Reset Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
              If you did not request this email, you can safely ignore it.
            </td>
          </tr>
        </table>
      </body>
    `
  })
}
