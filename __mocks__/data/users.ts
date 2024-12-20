import { createId } from "@paralleldrive/cuid2"
import { Session } from "@/lib/auth-client"

export const mockUser1: Session["user"] = {
  id: createId(),
  name: "John Doe",
  birthdate: new Date("2000-01-01"),
  email: "john.doe@example.com",
  emailVerified: true,
  username: "john.doe",
  image: "https://example.com/avatar.jpg",
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  banned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockUser2: Session["user"] = {
  id: createId(),
  name: "Jane Smith",
  birthdate: new Date("1985-05-15"),
  email: "test_jane@example.dev",
  emailVerified: true,
  username: "janesmith",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  banned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockUser3: Session["user"] = {
  id: createId(),
  name: "Sam Lee",
  birthdate: new Date("2000-07-21"),
  email: "test_sam@example.dev",
  emailVerified: true,
  username: "samlee",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  banned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockUser4: Session["user"] = {
  id: createId(),
  name: "Chris Green",
  birthdate: null,
  email: "test_chris@example.dev",
  emailVerified: true,
  username: "chrisgreen",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  banned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockUser5: Session["user"] = {
  id: createId(),
  name: "Patricia White",
  birthdate: new Date("1992-02-28"),
  email: "test_patricia@example.dev",
  emailVerified: true,
  username: "patwhite",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  banned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockSession = {
  data: {
    user: mockUser1,
    session: {
      id: createId(),
      userId: mockUser1.id,
      token: "mockToken",
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accounts: [],
  },
  isPending: false,
  error: null,
}

export const mockSessionCredentialAccount = {
  id: createId(),
  userId: mockUser1.id,
  accountId: mockUser1.id,
  providerId: "credential",
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  idToken: null,
  scope: null,
  password:
    "e1a88ca304b208dbf4544cb4fc698cc1:5274627b6ac84a28571303548ce3a8bc4bd5ab49342a3ee8e63e2f9596668378596710e41b4ad4e252e77fce5617e6600edf7af822d6c4c8bea37795829f5dbe",
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockSessionGitHubAccount = {
  id: createId(),
  userId: mockUser1.id,
  accountId: "1234567",
  providerId: "github",
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  idToken: null,
  scope: null,
  password: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockPendingSession = {
  data: null,
  isPending: true,
  error: null,
}

export const mockErrorSession = {
  data: null,
  isPending: false,
  error: {
    status: 500,
    statusText: "Internal Server Error",
    error: "Something went wrong",
    name: "FetchError",
    message: "Failed to fetch session",
  },
}
