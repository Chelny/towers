import { ReactNode } from "react";
import { I18n } from "@lingui/core";
import { initLingui } from "@/app/init-lingui";
import { APP_CONFIG } from "@/constants/app";
import { BODY_STYLE, EMAIL_COLORS } from "@/constants/email";
import { defaultLocale } from "@/translations/languages";

type EmailTemplateProps = {
  html: string
  locale: string
};

export default function EmailTemplate({ html, locale = defaultLocale }: EmailTemplateProps): ReactNode {
  const appName: string = APP_CONFIG.NAME;
  const startingYear: number = 2024;
  const currentYear: number = new Date().getFullYear();
  const copyrightYear: string = startingYear === currentYear ? `${startingYear}` : `${startingYear}–${currentYear}`;
  const i18n: I18n = initLingui(locale);

  return (
    <body style={{ paddingBottom: "32px", background: EMAIL_COLORS.background }}>
      <table
        border={0}
        cellSpacing={20}
        cellPadding={0}
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "8px",
          margin: "32px auto 16px",
          backgroundColor: EMAIL_COLORS.mainBackground,
          wordBreak: "break-word",
        }}
      >
        <thead>
          <tr>
            <th>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt={APP_CONFIG.NAME} title={APP_CONFIG.NAME} />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={BODY_STYLE}>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style={BODY_STYLE}>— {i18n._("The {appName} Team", { appName })}</td>
          </tr>
        </tfoot>
      </table>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td
              style={{
                color: EMAIL_COLORS.footerText,
                fontFamily: "sans-serif",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {i18n._("© {copyrightYear} {appName}, All Rights Reserved", { copyrightYear, appName })}
              <br />
              {APP_CONFIG.ADDRESS}
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  );
}
