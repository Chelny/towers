import { fireEvent, render, screen } from "@testing-library/react"
import { signIn } from "next-auth/react"
import { SocialLoginButtons } from "@/components/SocialLoginButtons"
import { ROUTE_ROOMS } from "@/constants"

vi.mock("next-auth/react", () => ({
  signIn: vi.fn()
}))

describe("SocialLoginButtons Component", () => {
  it("should render Google and GitHub login buttons", () => {
    render(<SocialLoginButtons disabled={false} />)

    expect(screen.getByText("Login with Google")).toBeInTheDocument()
    expect(screen.getByText("Login with GitHub")).toBeInTheDocument()
  })

  it("should call signIn with Google when Google button is clicked", () => {
    render(<SocialLoginButtons disabled={false} />)

    const googleButton: HTMLButtonElement = screen.getByTestId("sign-in-google-button")
    fireEvent.click(googleButton)

    expect(signIn).toHaveBeenCalledWith("google", {
      callbackUrl: ROUTE_ROOMS.PATH
    })
  })

  it("should call signIn with GitHub when GitHub button is clicked", () => {
    render(<SocialLoginButtons disabled={false} />)

    const githubButton: HTMLButtonElement = screen.getByTestId("sign-in-github-button")
    fireEvent.click(githubButton)

    expect(signIn).toHaveBeenCalledWith("github", {
      callbackUrl: ROUTE_ROOMS.PATH
    })
  })

  it("should disable the buttons when disabled prop is true", () => {
    render(<SocialLoginButtons disabled={true} />)

    const googleButton: HTMLButtonElement = screen.getByTestId("sign-in-google-button")
    const githubButton: HTMLButtonElement = screen.getByTestId("sign-in-github-button")

    expect(googleButton).toBeDisabled()
    expect(githubButton).toBeDisabled()
  })
})
