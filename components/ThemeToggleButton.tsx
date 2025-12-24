import { ReactNode, useEffect, useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { WebsiteTheme } from "db/enums";
import { useTheme } from "next-themes";
import { IconType } from "react-icons/lib";
import { TbBrightnessFilled, TbMoon, TbSunHigh } from "react-icons/tb";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import SidebarMenuItem from "@/components/SidebarMenuItem";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";

export default function ThemeToggleButton({ isExpanded }: { isExpanded: boolean }): ReactNode {
  const { setTheme } = useTheme();
  const { t } = useLingui();
  const { session } = useSocket();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [websiteTheme, setWebsiteTheme] = useState<WebsiteTheme>(WebsiteTheme.SYSTEM);

  const labelMap: Record<WebsiteTheme, string> = {
    [WebsiteTheme.LIGHT]: t({ message: "Light" }),
    [WebsiteTheme.DARK]: t({ message: "Dark" }),
    [WebsiteTheme.SYSTEM]: t({ message: "System" }),
  };

  const themeLabel: string = labelMap[websiteTheme];

  const { data: settingsResponse, mutate } = useSWR<ApiResponse<{ theme: WebsiteTheme }>>(
    `/api/users/${session?.user.id}/settings`,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const { trigger: updateSettings, isMutating } = useSWRMutation(
    `/api/users/${session?.user.id}/settings`,
    (url: string, { arg }: { arg: { theme: WebsiteTheme } }) =>
      fetcher<{ theme: WebsiteTheme }>(url, { method: "PATCH", body: JSON.stringify(arg) }),
    {
      revalidate: false,
    },
  );

  const Icon: IconType =
    websiteTheme === WebsiteTheme.LIGHT ? TbSunHigh : websiteTheme === WebsiteTheme.DARK ? TbMoon : TbBrightnessFilled;

  const handleSetTheme = async (): Promise<void> => {
    const nextTheme: WebsiteTheme =
      websiteTheme === WebsiteTheme.LIGHT
        ? WebsiteTheme.DARK
        : websiteTheme === WebsiteTheme.DARK
          ? WebsiteTheme.SYSTEM
          : WebsiteTheme.LIGHT;

    try {
      await updateSettings({ theme: nextTheme });
      setWebsiteTheme(nextTheme);
      setTheme(nextTheme.toLowerCase());
    } catch {
      const fallback: WebsiteTheme = settingsResponse?.data?.theme ?? WebsiteTheme.SYSTEM;
      setWebsiteTheme(fallback);
      setTheme(fallback.toLowerCase());
    }
  };

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!settingsResponse?.data?.theme) return;
    setWebsiteTheme(settingsResponse.data.theme);
  }, [settingsResponse?.data?.theme]);

  useEffect(() => {
    setTheme(websiteTheme.toLowerCase());
  }, [websiteTheme]);

  if (!isMounted) return null;

  return (
    <SidebarMenuItem
      id="website-theme"
      Icon={Icon}
      ariaLabel={t({ message: "Theme" })}
      isExpanded={isExpanded}
      disabled={isMutating}
      onClick={handleSetTheme}
    >
      <Trans>Theme: {themeLabel}</Trans>
    </SidebarMenuItem>
  );
}
