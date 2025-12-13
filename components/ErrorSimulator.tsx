import { ReactNode, useState } from "react";

export const ErrorSimulator = ({ message = "An error occurred" }: { message?: string }): ReactNode => {
  const [error, setError] = useState<boolean>(false);

  if (error) throw new Error(message);

  return (
    <button type="button" onClick={() => setError(true)}>
      Click here to show error page
    </button>
  );
};
