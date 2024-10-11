import { User, UserStatus } from "@prisma/client"
import { TSessionContextValue } from "@/context/session-context"

export const mockUser1: User = {
  id: "112dc46f-54cb-43f9-81fa-21080a4fb990",
  name: "John Doe",
  birthdate: new Date("2000-01-01"),
  email: "john.doe@example.com",
  emailVerified: new Date("2024-09-01"),
  pendingEmail: null,
  username: "john.doe",
  password: "Password123!",
  image: "https://example.com/avatar.jpg",
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: UserStatus.ACTIVE,
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockLoadingSession: TSessionContextValue = {
  data: null,
  status: "loading",
  update: vi.fn()
}

export const mockUnauthenticatedSession: TSessionContextValue = {
  data: null,
  status: "unauthenticated",
  update: vi.fn()
}

export const mockAuthenticatedSession: TSessionContextValue = {
  data: {
    user: {
      id: mockUser1.id,
      name: mockUser1.name,
      username: mockUser1.username!,
      image: mockUser1.image
    },
    account: null,
    isNewUser: false,
    expires: "2024-01-01T00:00:00Z"
  },
  status: "authenticated",
  update: vi.fn()
}

export const mockUser2: User = {
  id: "6db799ae-bb22-4257-aed2-58788d3eb6fb",
  name: "Jane Smith",
  birthdate: new Date("1985-05-15"),
  email: "test_jane@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
  username: "janesmith",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: UserStatus.ACTIVE,
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockUser3: User = {
  id: "a20ec552-68a5-4734-9530-e16a5074150d",
  name: "Sam Lee",
  birthdate: new Date("2000-07-21"),
  email: "test_sam@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
  username: "samlee",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: UserStatus.ACTIVE,
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockUser4: User = {
  id: "5d6c6316-8edb-4556-90e0-65fe61dd6d5c",
  name: "Chris Green",
  birthdate: null,
  email: "test_chris@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
  username: "chrisgreen",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: UserStatus.ACTIVE,
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockUser5: User = {
  id: "cd6b72cb-ab7b-4405-b43d-126b620d4e0e",
  name: "Patricia White",
  birthdate: new Date("1992-02-28"),
  email: "test_patricia@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
  username: "patwhite",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: UserStatus.ACTIVE,
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}
