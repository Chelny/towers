import { fireEvent, render, screen } from "@testing-library/react"
import { signIn } from "next-auth/react"
import { SocialLoginButtons } from "@/components/SocialLoginButtons"
import { ROUTE_ROOMS } from "@/constants/routes"

vi.mock("next-auth/react", () => ({
  signIn: vi.fn()
}))

describe("SocialLoginButtons Component", () => {
  it("should render GitHub and Google login buttons", () => {
    render(<SocialLoginButtons disabled={false} />)

    expect(screen.getByText("Login with GitHub")).toBeInTheDocument()
    expect(screen.getByText("Login with Google")).toBeInTheDocument()
  })

  it("should call signIn with GitHub when GitHub button is clicked", () => {
    render(<SocialLoginButtons disabled={false} />)

    const githubButton: HTMLButtonElement = screen.getByTestId("sign-in-github-button")
    fireEvent.click(githubButton)

    expect(signIn).toHaveBeenCalledWith("github", {
      callbackUrl: ROUTE_ROOMS.PATH
    })
  })

  it("should call signIn with Google when Google button is clicked", () => {
    render(<SocialLoginButtons disabled={false} />)

    const googleButton: HTMLButtonElement = screen.getByTestId("sign-in-google-button")
    fireEvent.click(googleButton)

    expect(signIn).toHaveBeenCalledWith("google", {
      callbackUrl: ROUTE_ROOMS.PATH
    })
  })

  it("should disable the buttons when disabled prop is true", () => {
    render(<SocialLoginButtons disabled={true} />)

    const githubButton: HTMLButtonElement = screen.getByTestId("sign-in-github-button")
    const googleButton: HTMLButtonElement = screen.getByTestId("sign-in-google-button")

    expect(googleButton).toBeDisabled()
    expect(githubButton).toBeDisabled()
  })
})
