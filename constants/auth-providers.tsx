import { FaDiscord, FaFacebook, FaGithub, FaGitlab, FaGoogle, FaTwitch, FaXTwitter } from "react-icons/fa6"
import { AuthProviderDetails } from "@/lib/providers"

export const AUTH_PROVIDERS: AuthProviderDetails[] = [
  { name: "discord", label: "Discord", icon: <FaDiscord className="w-5 h-5" fill="#7289da" aria-hidden="true" /> },
  { name: "facebook", label: "Facebook", icon: <FaFacebook className="w-5 h-5" fill="#1877F2" aria-hidden="true" /> },
  { name: "github", label: "GitHub", icon: <FaGithub className="w-5 h-5" fill="#171515" aria-hidden="true" /> },
  { name: "gitlab", label: "GitLab", icon: <FaGitlab className="w-5 h-5" fill="#FC6D26" aria-hidden="true" /> },
  { name: "google", label: "Google", icon: <FaGoogle className="w-5 h-5" fill="#4285F4" aria-hidden="true" /> },
  { name: "twitch", label: "Twitch", icon: <FaTwitch className="w-5 h-5" fill="#9146FF" aria-hidden="true" /> },
  { name: "twitter", label: "Twitter/X", icon: <FaXTwitter className="w-5 h-5" fill="#000000" aria-hidden="true" /> },
]
