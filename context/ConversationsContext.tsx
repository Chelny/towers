"use client";

import { createContext, PropsWithChildren, ReactNode, useContext, useState } from "react";

interface ConversationsContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider = ({ children }: PropsWithChildren): ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = (): void => setIsOpen(true);
  const close = (): void => setIsOpen(false);

  return <ConversationsContext.Provider value={{ isOpen, open, close }}>{children}</ConversationsContext.Provider>;
};

export const useConversations = (): ConversationsContextType => {
  const context: ConversationsContextType | undefined = useContext(ConversationsContext);
  if (!context) throw new Error("useConversations must be used inside ConversationsProvider");
  return context;
};
