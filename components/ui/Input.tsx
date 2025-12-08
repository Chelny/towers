"use client";

import {
  ClipboardEvent,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  InputEvent,
  KeyboardEvent,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Button from "@/components/ui/Button";

export interface InputImperativeHandle {
  value: string | null | undefined
  focus: () => void
  clear: () => void
}

type InputProps = {
  id: string
  label?: string
  type?: string
  className?: string
  placeholder?: string
  autoComplete?: string
  maxLength?: number
  defaultValue?: string | null | undefined
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  dataTestId?: string
  description?: string
  errorMessage?: string
  inlineButtonText?: string
  onInput?: (_: InputEvent<HTMLInputElement>) => void
  onPaste?: (_: ClipboardEvent<HTMLInputElement>) => void
  onKeyDown?: (_: KeyboardEvent<HTMLInputElement>) => void
  onInlineButtonClick?: () => void
};

export default forwardRef<InputImperativeHandle, InputProps>(function Input(
  {
    id,
    label,
    type = "text",
    className = "",
    placeholder = "",
    autoComplete = undefined,
    maxLength = undefined,
    defaultValue = "",
    required = false,
    readOnly = false,
    disabled = false,
    dataTestId = undefined,
    description = "",
    errorMessage = "",
    inlineButtonText = undefined,
    onInput,
    onPaste,
    onKeyDown,
    onInlineButtonClick,
  }: InputProps,
  ref: ForwardedRef<InputImperativeHandle>,
): ReactNode {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string | null | undefined>(defaultValue);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const inputType: string = type === "password" && isPasswordVisible ? "text" : type;

  const handleInput = (event: InputEvent<HTMLInputElement>): void => {
    setValue((event.target as HTMLInputElement).value);
    onInput?.(event);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    onPaste?.(event);
  };

  const handleKeydown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      if (typeof inlineButtonText !== "undefined") {
        onInlineButtonClick?.();
      }
    }

    onKeyDown?.(event);
  };

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((isPasswordVisible: boolean) => !isPasswordVisible);
  };

  useImperativeHandle(ref, () => ({
    value,
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(""),
  }));

  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label id={`${id}Label`} htmlFor={id} className="mb-1 font-medium">
          {label}{" "}
          {!required && (
            <span className={clsx("text-neutral-500", "dark:text-dark-text-muted")}>
              (<Trans>optional</Trans>)
            </span>
          )}
        </label>
      )}
      <div className={clsx("flex flex-row-row-reverse items-center gap-2 w-full", "rtl:flex")}>
        <div className="relative flex items-center w-full">
          <input
            ref={inputRef}
            type={inputType}
            id={id}
            name={id}
            className={clsx(
              "overflow-hidden w-full p-1 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-xs bg-white text-black line-clamp-1",
              type === "password" && "pe-7",
              "read-only:bg-gray-200",
              "disabled:border-t-gray-600/50 disabled:border-e-gray-400/50 disabled:border-b-gray-400/50 disabled:border-s-gray-600/50 disabled:bg-gray-200/50 disabled:text-black/50 disabled:cursor-not-allowed",
              "dark:border-t-dark-input-border-top dark:border-e-dark-input-border-end dark:border-b-dark-input-border-bottom dark:border-s-dark-input-border-start dark:bg-dark-input-background dark:text-dark-input-text",
              "dark:read-only:bg-dark-input-readonly-background dark:read-only:text-dark-input-readonly-text",
              "dark:disabled:border-t-dark-input-border-top/50 dark:disabled:border-e-dark-input-border-end/50 dark:disabled:border-b-dark-input-border-bottom/50 dark:disabled:border-s-dark-input-border-start/50 dark:disabled:bg-dark-input-disabled-background dark:disabled:text-dark-input-disabled-text",
              className,
            )}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            value={String(value)}
            required={required}
            readOnly={readOnly}
            disabled={disabled}
            aria-labelledby={`${id}Label`}
            aria-describedby={description ? `${id}Description` : undefined}
            aria-placeholder={placeholder}
            aria-invalid={errorMessage ? "true" : "false"}
            aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
            data-testid={dataTestId}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeydown}
            onFocus={(event: FocusEvent<HTMLInputElement>) => event.stopPropagation()}
          />
          {type === "password" && (
            <button
              type="button"
              className={clsx("absolute inset-y-0 end-2 flex items-center text-gray-800", "dark:text-dark-input-text")}
              aria-label={isPasswordVisible ? t({ message: "Hide password" }) : t({ message: "Show password" })}
              onClick={handleTogglePasswordVisibility}
            >
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}
        </div>
        {typeof inlineButtonText !== "undefined" && (
          <Button
            type="button"
            className="shrink-0"
            dataTestId={dataTestId ? `${dataTestId}_inline-button` : undefined}
            onClick={onInlineButtonClick}
          >
            {inlineButtonText}
          </Button>
        )}
      </div>
      {description && (
        <p id={`${id}Description`} className={clsx("text-neutral-500", "dark:text-dark-text-muted")}>
          {description}
        </p>
      )}
      {errorMessage && (
        <span id={`${id}ErrorMessage`} className={clsx("text-red-600", "dark:text-red-400")}>
          {errorMessage}
        </span>
      )}
    </div>
  );
});
