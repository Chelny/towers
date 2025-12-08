import { USERNAME_PATTERN } from "@/constants/regex";
import { generateRandomUsername } from "@/utils/user";

describe("generateRandomUsername", () => {
  it("should generate a username with base and a random suffix", () => {
    const base: string = "john.doe";
    const username: string = generateRandomUsername(base);
    expect(username).toMatch(USERNAME_PATTERN);
    expect(username).toMatch(new RegExp(`^${base}\\d{4}$`));
  });

  it("should not exceed the maximum length of 32 characters", () => {
    const base: string = "a".repeat(30);
    const username: string = generateRandomUsername(base);
    expect(username).toMatch(USERNAME_PATTERN);
  });

  it("should handle base string longer than max length", () => {
    const base: string = "a".repeat(40);
    const username: string = generateRandomUsername(base);
    expect(username).toMatch(USERNAME_PATTERN);
  });

  it("should handle invalid base strings by sanitizing them", () => {
    const base: string = ".john.doe";
    const username: string = generateRandomUsername(base);
    expect(username).toMatch(USERNAME_PATTERN);
  });
});
