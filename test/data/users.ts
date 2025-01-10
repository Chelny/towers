import { createId } from "@paralleldrive/cuid2"
import { User } from "@prisma/client"

const commonUserProperties = {
  language: "en",
  role: "user",
  isOnline: true,
  lastActiveAt: new Date(),
  banned: false,
  banReason: null,
  banExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockUser1: User = {
  id: createId(),
  name: "John Doe",
  birthdate: new Date("2000-01-01"),
  email: "john.doe@example.com",
  emailVerified: true,
  username: "john.doe",
  image: "https://example.com/avatar.jpg",
  ...commonUserProperties,
}

export const mockUser2: User = {
  id: createId(),
  name: "Jane Smith",
  birthdate: new Date("1985-05-15"),
  email: "test_jane@example.dev",
  emailVerified: true,
  username: "janesmith",
  image: null,
  ...commonUserProperties,
}

export const mockUser3: User = {
  id: createId(),
  name: "Sam Lee",
  birthdate: new Date("2000-07-21"),
  email: "test_sam@example.dev",
  emailVerified: true,
  username: "samlee",
  image: null,
  ...commonUserProperties,
}

export const mockUser4: User = {
  id: createId(),
  name: "Chris Green",
  birthdate: null,
  email: "test_chris@example.dev",
  emailVerified: true,
  username: "chrisgreen",
  image: null,
  ...commonUserProperties,
}

export const mockUser5: User = {
  id: createId(),
  name: "Patricia White",
  birthdate: new Date("1992-02-28"),
  email: "test_patricia@example.dev",
  emailVerified: true,
  username: "patwhite",
  image: null,
  ...commonUserProperties,
}
