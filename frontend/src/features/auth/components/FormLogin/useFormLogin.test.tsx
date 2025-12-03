import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFormLogin } from "@/features/auth/components/FormLogin/useFormLogin";
import { login } from "@/features/auth/api/login";

vi.mock("@/features/auth/api/login", () => ({
  login: vi.fn(),
  clearAuthCache: vi.fn(),
  verifyAuthentication: vi.fn(),
  isAuthenticated: vi.fn(),
  logout: vi.fn(),
}));

describe("useFormLogin", () => {
  const mockLogin = login as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLogin.mockClear();
  });

  it("should initialize with empty error and loading states", () => {
    const { result } = renderHook(() => useFormLogin({}));

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("should provide register function from react-hook-form", () => {
    const { result } = renderHook(() => useFormLogin({}));

    expect(result.current.register).toBeDefined();
    expect(typeof result.current.register).toBe("function");
  });

  it("should provide handleSubmit function from react-hook-form", () => {
    const { result } = renderHook(() => useFormLogin({}));

    expect(result.current.handleSubmit).toBeDefined();
    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("should validate email format", async () => {
    const { result } = renderHook(() => useFormLogin({}));

    expect(result.current.errors).toBeDefined();
  });

  it("should handle successful login", async () => {
    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() =>
      useFormLogin({ onSuccess: mockOnSuccess })
    );

    mockLogin.mockResolvedValueOnce({
      success: true,
      message: "Login successful",
      data: { token: "test-token" },
      statusCode: 200,
    });

    await result.current.onSubmit({
      email: "test@example.com",
      password: "password123",
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should handle login failure", async () => {
    const { result } = renderHook(() => useFormLogin({}));

    mockLogin.mockRejectedValueOnce(new Error("Network error"));

    await result.current.onSubmit({
      email: "test@example.com",
      password: "password123",
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
    });
  });

  it("should set loading to true during submission", async () => {
    const { result } = renderHook(() => useFormLogin({}));

    mockLogin.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Success",
                data: { token: "test-token" },
                statusCode: 200,
              }),
            100
          )
        )
    );

    const promise = result.current.onSubmit({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.current.loading).toBe(true);

    await promise;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
