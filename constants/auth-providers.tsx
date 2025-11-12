import { FaGithub, FaGoogle } from "react-icons/fa6";
import { AuthProviderDetails } from "@/lib/providers";

export const AUTH_PROVIDERS: AuthProviderDetails[] = [
  { name: "github", label: "GitHub", icon: <FaGithub className="w-5 h-5" aria-hidden="true" /> },
  { name: "google", label: "Google", icon: <FaGoogle className="w-5 h-5" aria-hidden="true" /> },
];
