import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import { RoomLevel } from "db/browser";

export const getRoomLevelBadgeClasses = (level: RoomLevel): string => {
  const baseClasses: string = "px-1 py-0.5 rounded text-sm font-medium";

  switch (level) {
    case RoomLevel.SOCIAL:
      return `${baseClasses} bg-green-300 text-green-800 dark:bg-green-800 dark:text-green-200`;
    case RoomLevel.BEGINNER:
      return `${baseClasses} bg-blue-300 text-blue-800 dark:bg-blue-800 dark:text-blue-200`;
    case RoomLevel.INTERMEDIATE:
      return `${baseClasses} bg-purple-300 text-purple-800 dark:bg-purple-800 dark:text-purple-200`;
    case RoomLevel.ADVANCED:
      return `${baseClasses} bg-red-300 text-red-800 dark:bg-red-900 dark:text-red-200`;
    default:
      return `${baseClasses} bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-200`;
  }
};

export const getRoomLevelText = (level: RoomLevel): ReactNode => {
  switch (level) {
    case RoomLevel.SOCIAL:
      return <Trans>Social</Trans>;
    case RoomLevel.BEGINNER:
      return <Trans>Beginner</Trans>;
    case RoomLevel.INTERMEDIATE:
      return <Trans>Intermediate</Trans>;
    case RoomLevel.ADVANCED:
      return <Trans>Advanced</Trans>;
    default:
      return null;
  }
};
