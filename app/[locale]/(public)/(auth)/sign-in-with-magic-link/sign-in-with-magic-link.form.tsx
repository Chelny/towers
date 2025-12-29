"use client";

import { FormEvent, ReactNode, useState } from "react";
import { ErrorContext } from "@better-fetch/fetch";
import { Trans, useLingui } from "@lingui/react/macro";
import { ValueError } from "@sinclair/typebox/errors";
import { Value } from "@sinclair/typebox/value";
import {
  SignInWithMagicLinkFormValidationErrors,
  SignInWithMagicLinkPayload,
  signInWithMagicLinkSchema,
} from "@/app/[locale]/(public)/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.schema";
import AlertMessage from "@/components/ui/AlertMessage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { INITIAL_FORM_STATE } from "@/constants/api";
import { CALLBACK_URL } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";

export function SignInWithMagicLinkForm(): ReactNode {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<ApiResponse>(INITIAL_FORM_STATE);
  const { t } = useLingui();

  const handleSignInWithMagicLink = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const formData: FormData = new FormData(event.currentTarget);
    const payload: SignInWithMagicLinkPayload = {
      email: formData.get("email") as string,
    };

    const errors: ValueError[] = Array.from(Value.Errors(signInWithMagicLinkSchema, payload));
    const errorMessages: SignInWithMagicLinkFormValidationErrors = {};

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "email":
          errorMessages.email = t({ message: "The email is invalid." });
          break;
        default:
          logger.warn(`Sign Up With Magic Link Validation: Unknown error at ${error.path}`);
          break;
      }
    }

    if (Object.keys(errorMessages).length > 0) {
      setFormState({
        success: false,
        message: t({ message: "Validation errors occurred." }),
        error: errorMessages,
      });
    } else {
      await authClient.signIn.magicLink(
        {
          email: payload.email,
          callbackURL: CALLBACK_URL,
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
          onSuccess: () => {
            const email: string = payload.email;
            setFormState({
              success: true,
              message: t({ message: `We’ve sent a magic sign-in link to ${email}` }),
            });
          },
        },
      );
    }
  };

  return (
    <form className="w-full" noValidate onSubmit={handleSignInWithMagicLink}>
      {formState.message && (
        <AlertMessage type={formState.success ? "success" : "error"}>{formState.message}</AlertMessage>
      )}
      <Input
        type="email"
        id="email"
        label={t({ message: "Email" })}
        required
        dataTestId="sign-in-with-magic-link_input-email_email"
        errorMessage={formState?.error?.email}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        <Trans>Email Me A Sign In Link</Trans>
      </Button>
    </form>
  );
}
