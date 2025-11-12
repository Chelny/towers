import { SocketCallback } from "@/interfaces/socket";

export const handleSocketError = (
  error: unknown,
  callback: <T>({ success, message }: SocketCallback<T>) => void,
): void => {
  let message: string = "An unexpected error occurred.";

  if (error instanceof Error) {
    message = error.message;
  }

  callback({ success: false, message });
};
