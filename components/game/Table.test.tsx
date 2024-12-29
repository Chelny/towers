import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Table from "@/components/game/Table"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { mockRoom1 } from "@/test/data/rooms"
import { mockRoom1Table1 } from "@/test/data/tables"
import { mockSession } from "@/test/data/users"

const { useRouter } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush,
  }
})

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    const { priority, crossOrigin, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />
  },
}))

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter,
  }
})

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe("Table Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the chat input and allows message sending", () => {
    render(<Table roomId={mockRoom1.id} tableId={mockRoom1Table1.id} />)

    const messageInput: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(messageInput, { target: { value: "Hello!" } })
    fireEvent.keyDown(messageInput, { key: "Enter" })

    expect(mockAppDispatch).toHaveBeenCalled()
  })

  it("should render the correct table type and rated status", () => {
    render(<Table roomId={mockRoom1.id} tableId={mockRoom1Table1.id} />)

    expect(screen.getByText("Public")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it.todo("should handle seat click correctly", () => {
    render(<Table roomId={mockRoom1.id} tableId={mockRoom1Table1.id} />)
  })
})
