import { FaDiscord, FaFacebook, FaGithub, FaGitlab, FaGoogle, FaTwitch, FaXTwitter } from "react-icons/fa6"
import { AuthProviderDetails } from "@/lib/providers"

export const AUTH_PROVIDERS: AuthProviderDetails[] = [
  { name: "discord", label: "Discord", icon: <FaDiscord className="w-5 h-5" aria-hidden="true" /> },
  { name: "facebook", label: "Facebook", icon: <FaFacebook className="w-5 h-5" aria-hidden="true" /> },
  { name: "github", label: "GitHub", icon: <FaGithub className="w-5 h-5" aria-hidden="true" /> },
  { name: "gitlab", label: "GitLab", icon: <FaGitlab className="w-5 h-5" aria-hidden="true" /> },
  { name: "google", label: "Google", icon: <FaGoogle className="w-5 h-5" aria-hidden="true" /> },
  { name: "twitch", label: "Twitch", icon: <FaTwitch className="w-5 h-5" aria-hidden="true" /> },
  { name: "twitter", label: "Twitter/X", icon: <FaXTwitter className="w-5 h-5" aria-hidden="true" /> },
]
