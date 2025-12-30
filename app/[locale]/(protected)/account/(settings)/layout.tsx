import { ReactNode } from "react";
import Link from "next/link";
import { I18n } from "@lingui/core";
import { initLingui } from "@/app/init-lingui";
import { ROUTE_DELETE_ACCOUNT, ROUTE_SETTINGS } from "@/constants/routes";

type SettingsLayoutProps = LayoutProps<"/[locale]/account">;

export default async function SettingsLayout({ children, params }: SettingsLayoutProps): Promise<ReactNode> {
  const { locale } = await params;
  const i18n: I18n = initLingui(locale);

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_SETTINGS.TITLE)}</h1>
      <div className="grid grid-cols-[max-content_1fr] gap-6">
        <aside className="w-50 mt-4">
          <nav className="flex">
            <ul className="space-y-6">
              {/* Preferences */}
              <li>
                <h3 className="mb-2 text-lg font-semibold text-muted-foreground">{i18n._("Preferences")}</h3>
                <ul className="space-y-1">
                  <li>
                    <Link href={ROUTE_SETTINGS.PATH} className="youpi-link">
                      {i18n._("Language")}
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTE_SETTINGS.PATH} className="youpi-link">
                      {i18n._("Theme")}
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Danger zone */}
              <li>
                <h3 className="mb-2 text-lg font-semibold text-red-500">{i18n._("Danger zone")}</h3>
                <ul>
                  <li>
                    <Link href={ROUTE_DELETE_ACCOUNT.PATH} className="youpi-link">
                      {i18n._(ROUTE_DELETE_ACCOUNT.TITLE)}
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </>
  );
}
