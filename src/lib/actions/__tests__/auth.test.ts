import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module
const mockUserFindUnique = vi.fn();
const mockUserCreate = vi.fn();
const mockUserUpdate = vi.fn();
const mockVerificationTokenCreate = vi.fn();
const mockVerificationTokenFindUnique = vi.fn();
const mockVerificationTokenDelete = vi.fn();
const mockVerificationTokenDeleteMany = vi.fn();
const mockMembershipCreate = vi.fn();
const mockTransaction = vi.fn();
const mockEmailSend = vi.fn().mockResolvedValue({ id: "email-1" });

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    verificationToken: {
      create: (...args: unknown[]) => mockVerificationTokenCreate(...args),
      findUnique: (...args: unknown[]) => mockVerificationTokenFindUnique(...args),
      delete: (...args: unknown[]) => mockVerificationTokenDelete(...args),
      deleteMany: (...args: unknown[]) => mockVerificationTokenDeleteMany(...args),
    },
    membership: {
      create: (...args: unknown[]) => mockMembershipCreate(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const { signUpAction, signInAction, resetPasswordAction, newPasswordAction } =
  await import("../auth");

function formData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}

describe("signUpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockResolvedValue([{ id: "user-1" }, { token: "tok" }]);
    mockUserFindUnique.mockResolvedValue(null);
    mockMembershipCreate.mockResolvedValue({ id: "mem-1" });
  });

  it("rejects missing name", async () => {
    const result = await signUpAction({}, formData({
      name: "",
      email: "test@test.com",
      password: "password123",
      confirmPassword: "password123",
    }));
    expect(result.error).toBeDefined();
  });

  it("rejects invalid email", async () => {
    const result = await signUpAction({}, formData({
      name: "Test",
      email: "not-email",
      password: "password123",
      confirmPassword: "password123",
    }));
    expect(result.error).toBeDefined();
  });

  it("rejects short password", async () => {
    const result = await signUpAction({}, formData({
      name: "Test",
      email: "test@test.com",
      password: "short",
      confirmPassword: "short",
    }));
    expect(result.error).toBeDefined();
  });

  it("rejects mismatched passwords", async () => {
    const result = await signUpAction({}, formData({
      name: "Test",
      email: "test@test.com",
      password: "password123",
      confirmPassword: "password456",
    }));
    expect(result.error).toBe("Passwords do not match");
  });

  it("rejects existing email", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "existing-user" });

    const result = await signUpAction({}, formData({
      name: "Test",
      email: "existing@test.com",
      password: "password123",
      confirmPassword: "password123",
    }));
    expect(result.error).toBe("An account with this email already exists");
  });

  it("creates user and redirects on valid signup", async () => {
    // After transaction, findUnique returns the new user for membership creation
    mockUserFindUnique
      .mockResolvedValueOnce(null) // existence check
      .mockResolvedValueOnce({ id: "user-1" }); // post-creation lookup

    await expect(
      signUpAction({}, formData({
        name: "Test User",
        email: "new@test.com",
        password: "password123",
        confirmPassword: "password123",
      }))
    ).rejects.toThrow("REDIRECT:");

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockEmailSend).toHaveBeenCalled();
  });
});

describe("signInAction", () => {
  it("rejects empty password", async () => {
    const result = await signInAction({}, formData({
      email: "test@test.com",
      password: "",
    }));
    expect(result.error).toBeDefined();
  });

  it("rejects invalid email", async () => {
    const result = await signInAction({}, formData({
      email: "not-email",
      password: "password123",
    }));
    expect(result.error).toBeDefined();
  });
});

describe("resetPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid email", async () => {
    const result = await resetPasswordAction({}, formData({ email: "bad" }));
    expect(result.error).toBeDefined();
  });

  it("returns success even for non-existent user (prevents enumeration)", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const result = await resetPasswordAction({}, formData({ email: "nobody@test.com" }));
    expect(result.success).toBe(true);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it("sends reset email for existing user", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "user-1", name: "Test", email: "test@test.com" });
    mockVerificationTokenCreate.mockResolvedValue({ token: "tok" });

    const result = await resetPasswordAction({}, formData({ email: "test@test.com" }));
    expect(result.success).toBe(true);
    expect(mockEmailSend).toHaveBeenCalled();
    expect(mockVerificationTokenCreate).toHaveBeenCalled();
  });
});

describe("newPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects short password", async () => {
    const result = await newPasswordAction({}, formData({
      token: "tok-123",
      password: "short",
    }));
    expect(result.error).toBeDefined();
  });

  it("rejects expired token", async () => {
    mockVerificationTokenFindUnique.mockResolvedValue({
      token: "tok-123",
      identifier: "reset:test@test.com",
      expires: new Date(Date.now() - 1000), // expired
    });

    const result = await newPasswordAction({}, formData({
      token: "tok-123",
      password: "newpassword123",
    }));
    expect(result.error).toBe("Invalid or expired token");
  });

  it("rejects non-reset token", async () => {
    mockVerificationTokenFindUnique.mockResolvedValue({
      token: "tok-123",
      identifier: "test@test.com", // not prefixed with reset:
      expires: new Date(Date.now() + 60000),
    });

    const result = await newPasswordAction({}, formData({
      token: "tok-123",
      password: "newpassword123",
    }));
    expect(result.error).toBe("Invalid token type");
  });

  it("updates password and redirects on valid token", async () => {
    mockVerificationTokenFindUnique.mockResolvedValue({
      token: "tok-123",
      identifier: "reset:test@test.com",
      expires: new Date(Date.now() + 60000),
    });
    mockUserUpdate.mockResolvedValue({ id: "user-1" });
    mockVerificationTokenDelete.mockResolvedValue({});

    await expect(
      newPasswordAction({}, formData({
        token: "tok-123",
        password: "newpassword123",
      }))
    ).rejects.toThrow("REDIRECT:");

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@test.com" },
        data: { passwordHash: "hashed-password" },
      })
    );
  });
});
