import { ReactNode, useEffect, useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { WebsiteTheme } from "db/enums";
import { useTheme } from "next-themes";
import { IconType } from "react-icons/lib";
import { TbBrightnessFilled, TbMoon, TbSunHigh } from "react-icons/tb";
import SidebarMenuItem from "@/components/SidebarMenuItem";
import { useSocket } from "@/context/SocketContext";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function ThemeToggleButton({ isExpanded }: { isExpanded: boolean }): ReactNode {
  const { setTheme } = useTheme();
  const { t } = useLingui();
  const { session } = useSocket();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { settingsResponse, isLoading, updateSettings, isMutating } = useUserSettings(session?.user.id);
  const websiteTheme: WebsiteTheme = settingsResponse?.data?.theme ?? WebsiteTheme.SYSTEM;

  const labelMap: Record<WebsiteTheme, string> = {
    [WebsiteTheme.LIGHT]: t({ message: "Light" }),
    [WebsiteTheme.DARK]: t({ message: "Dark" }),
    [WebsiteTheme.SYSTEM]: t({ message: "System" }),
  };

  const themeLabel: string = labelMap[websiteTheme];

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
      setTheme(nextTheme.toLowerCase());
    } catch {
      const fallback: WebsiteTheme = settingsResponse?.data?.theme ?? WebsiteTheme.SYSTEM;
      setTheme(fallback.toLowerCase());
    }
  };

  useEffect(() => setIsMounted(true), []);

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
      disabled={isLoading || isMutating}
      onClick={handleSetTheme}
    >
      <Trans>Theme: {themeLabel}</Trans>
    </SidebarMenuItem>
  );
}
