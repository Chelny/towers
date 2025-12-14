import { User, UserRole, WebsiteTheme } from "db/browser";

const commonUserProperties = {
  displayUsername: null,
  language: "en",
  role: UserRole.USER,
  theme: WebsiteTheme.SYSTEM,
  banned: false,
  banReason: null,
  banExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUser1: User = {
  id: "user-one-id",
  name: "John Doe",
  birthdate: new Date("2000-01-01"),
  email: "john.doe@example.com",
  emailVerified: true,
  username: "john.doe",
  image: "https://example.com/avatar.jpg",
  ...commonUserProperties,
};

export const mockUser2: User = {
  id: "user-two-id",
  name: "Jane Smith",
  birthdate: new Date("1935-12-31"),
  email: "test_jane@example.com",
  emailVerified: true,
  username: "jane_smith",
  image: null,
  ...commonUserProperties,
};

export const mockUser3: User = {
  id: "user-three-id",
  name: "Sam Lee",
  birthdate: null,
  email: "test_sam@example.com",
  emailVerified: true,
  username: "samlee",
  image: null,
  ...commonUserProperties,
};

export const mockUser4: User = {
  id: "user-four-id",
  name: "Chris Green",
  birthdate: null,
  email: "test_chris@example.com",
  emailVerified: true,
  username: "chrisgreen",
  image: null,
  ...commonUserProperties,
};

export const mockUser5: User = {
  id: "user-five-id",
  name: "Patricia White",
  birthdate: new Date("1992-02-28"),
  email: "test_patricia@example.com",
  emailVerified: true,
  username: "patwhite",
  image: null,
  ...commonUserProperties,
};
