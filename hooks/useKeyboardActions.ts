import { KeyboardEvent, useCallback } from "react";

interface KeyboardActionConfig {
  onEnter?: () => void
  onSpace?: () => void
  onKeyI?: () => void
  onCtrlEnter?: () => void
  isDisabled?: boolean
  isPreventDefault?: boolean
}

export function useKeyboardActions(config: KeyboardActionConfig) {
  const { onEnter, onSpace, onKeyI, onCtrlEnter, isDisabled = false, isPreventDefault = true } = config;

  return useCallback(
    (event: KeyboardEvent) => {
      if (isDisabled) return;

      const execute = (action?: () => void): void => {
        if (isPreventDefault) event.preventDefault();
        action?.();
      };

      switch (event.key) {
        case "Enter":
          if (event.ctrlKey && onCtrlEnter) {
            execute(onCtrlEnter);
          } else if (onEnter) {
            execute(onEnter);
          }
          break;
        case " ":
          if (onSpace) execute(onSpace);
          break;
        case "i":
        case "I":
          if (onKeyI) execute(onKeyI);
          break;
      }
    },
    [onEnter, onSpace, onKeyI, onCtrlEnter, isDisabled, isPreventDefault],
  );
}
