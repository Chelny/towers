import { ReactNode } from "react"
import Image from "next/image"
import { APP_ADDRESS, APP_NAME } from "@/constants/app"

const brandColor: string = "#115e59"
export const emailColors: Record<string, string> = {
  background: "#efeef1",
  text: "#444",
  mainBackground: "#fff",
  buttonBackground: brandColor,
  buttonBorder: brandColor,
  buttonText: "#fff",
  footerText: "#999",
}
const bodyStyle: Record<string, string> = {
  padding: "8px",
  color: emailColors.text,
  fontFamily: "sans-serif",
  fontSize: "16px",
  lineHeight: "22px",
}

type EmailTemplateProps = {
  html: string
}

export default function EmailTemplate({ html }: EmailTemplateProps): ReactNode {
  return (
    <body style={{ paddingBottom: "32px", background: emailColors.background }}>
      <table
        border={0}
        cellSpacing={20}
        cellPadding={0}
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "8px",
          margin: "32px auto 16px",
          backgroundColor: emailColors.mainBackground,
        }}
      >
        <thead>
          <tr>
            <th>
              <Image src="/logo.png" alt={APP_NAME} title={APP_NAME} />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={bodyStyle}>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style={bodyStyle}>— The Team</td>
          </tr>
        </tfoot>
      </table>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td
              style={{
                color: emailColors.footerText,
                fontFamily: "sans-serif",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              &copy; 2024 {APP_NAME}, All Rights Reserved
              <br />
              {APP_ADDRESS}
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  )
}
