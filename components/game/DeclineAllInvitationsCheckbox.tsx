"use client";

import { ChangeEvent, ReactNode } from "react";
import { useLingui } from "@lingui/react/macro";
import Checkbox from "@/components/ui/Checkbox";

type DeclineAllInvitationsCheckboxProps = {
  isDeclineAll: boolean
  isDisabled?: boolean
  onToggleDeclineAll: (isDeclined: boolean) => void
};

export default function DeclineAllInvitationsCheckbox({
  isDeclineAll,
  isDisabled = false,
  onToggleDeclineAll,
}: DeclineAllInvitationsCheckboxProps): ReactNode {
  const { t } = useLingui();

  return (
    <Checkbox
      id="declineAll"
      label={t({ message: "Decline All Invitations" })}
      defaultChecked={isDeclineAll}
      disabled={isDisabled}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onToggleDeclineAll(event.target.checked)}
    />
  );
}
