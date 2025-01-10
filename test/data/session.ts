import { createId } from "@paralleldrive/cuid2"
import { mockRoom1Table1TowersUserProfile1 } from "@/test/data/towersUserProfiles"
import { mockUser1 } from "@/test/data/users"

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
    userProfileIds: {
      towers: mockRoom1Table1TowersUserProfile1.id,
    },
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
