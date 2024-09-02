import { USERNAME_PATTERN } from "@/constants"
import { generateRandomUsername } from "@/utils"

describe("generateRandomUsername Utility", () => {
  it("should generate a username with base and a random suffix", () => {
    const base: string = "user"
    const username: string = generateRandomUsername(base)
    expect(username).toMatch(new RegExp(`^${base}\\d{4}$`))
  })

  it("should not exceed the maximum length of 32 characters", () => {
    const base: string = "a".repeat(30)
    const username: string = generateRandomUsername(base)
    expect(username.length).toBeLessThanOrEqual(32)
  })

  it("should match the USERNAME_PATTERN", () => {
    const base: string = "validbase"
    const username: string = generateRandomUsername(base)
    expect(username).toMatch(USERNAME_PATTERN)
  })

  it("should handle base string longer than max length", () => {
    const base: string = "a".repeat(40)
    const username: string = generateRandomUsername(base)
    expect(username).toMatch(/^a{28}\d{4}$/)
  })
})
