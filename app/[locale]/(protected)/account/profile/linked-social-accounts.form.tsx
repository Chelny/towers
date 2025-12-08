"use client";

import { ReactNode, useEffect, useState } from "react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { ErrorContext, SuccessContext } from "@better-fetch/fetch";
import { Trans, useLingui } from "@lingui/react/macro";
import AlertMessage from "@/components/ui/AlertMessage";
import Button from "@/components/ui/Button";
import { INITIAL_FORM_STATE } from "@/constants/api";
import { AUTH_PROVIDERS } from "@/constants/auth-providers";
import { ROUTE_PROFILE } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { AuthProvider, AuthProviderDetails } from "@/lib/providers";

export function LinkedSocialAccountsForm(): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const errorParam: string | null = searchParams.get("error");
  const [accountList, setAccountsList] = useState<{ id: string; provider: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE);
  const { t } = useLingui();

  const errorMessages: Record<string, string> = {
    "email_doesn't_match": t({
      message: "The email you provided does not match the one associated with your account.",
    }),
  };

  const getLinkedAccounts = async (): Promise<void> => {
    await authClient.listAccounts(
      {},
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onResponse: () => {
          setIsLoading(false);
        },
        onSuccess: (ctx: SuccessContext) => {
          setAccountsList(ctx.data);
        },
      },
    );
  };

  const isProviderLinked = (providerName: AuthProvider) =>
    accountList.some((account) => account.provider === providerName);

  const handleLinkUnlink = async (providerName: AuthProvider): Promise<void> => {
    if (isProviderLinked(providerName)) {
      // TODO: Unlink the account
    } else {
      // Link the account
      await authClient.linkSocial(
        {
          provider: providerName,
          callbackURL: ROUTE_PROFILE.PATH,
        },
        {
          onRequest: () => {
            setIsLoading(true);
            setFormState(INITIAL_FORM_STATE);
          },
          onResponse: () => {
            setIsLoading(false);
          },
          onError: (ctx: ErrorContext) => {
            setFormState({
              success: false,
              message: ctx.error.message,
            });
          },
          onSuccess: (ctx: SuccessContext) => {
            setFormState({
              success: true,
              message: t({ message: "The account has been linked!" }),
            });
            setAccountsList((prev) => [...prev, { id: ctx.data.id, provider: providerName }]);
          },
        },
      );
    }
  };

  useEffect(() => {
    if (errorParam && errorMessages[errorParam]) {
      setFormState({
        success: false,
        message: errorMessages[errorParam],
      });
    }

    getLinkedAccounts();
  }, []);

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">
        <Trans>Linked Social Accounts</Trans>
      </h2>
      {formState?.message && (
        <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
      )}
      <ul className="flex flex-col gap-4">
        {AUTH_PROVIDERS.map(({ name, label, icon }: AuthProviderDetails) => (
          <li key={name} className="flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center gap-2">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <Button
              key={name}
              type="button"
              className="flex-1 flex justify-center items-center"
              disabled={isLoading || isProviderLinked(name)}
              aria-label={isProviderLinked(name) ? t({ message: `Unlink ${label}` }) : t({ message: `Link ${label}` })}
              onClick={() => handleLinkUnlink(name)}
            >
              {isProviderLinked(name) ? t({ message: "Unlink" }) : t({ message: "Link" })}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
