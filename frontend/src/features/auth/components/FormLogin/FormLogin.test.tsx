import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { FormLogin } from "@/features/auth/components/FormLogin/FormLogin";
import { login } from "@/features/auth/api/login";

vi.mock("@/features/auth/api/login", () => ({
  login: vi.fn(),
  clearAuthCache: vi.fn(),
  verifyAuthentication: vi.fn(),
  isAuthenticated: vi.fn(),
  logout: vi.fn(),
}));

describe("FormLogin", () => {
  const mockLogin = login as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLogin.mockClear();
  });

  it("should render login form with email and password fields", () => {
    renderWithProviders(<FormLogin />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i })
    ).toBeInTheDocument();
  });

  it("should display description text", () => {
    renderWithProviders(<FormLogin />);

    expect(
      screen.getByText("Enter your email and password to access your account.")
    ).toBeInTheDocument();
  });

  it("should validate email field and show error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("should validate password field and show error for empty password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
    });
  });

  it("should validate password minimum length", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "12345");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
    });
  });

  it("should submit form with valid credentials", async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();

    mockLogin.mockResolvedValueOnce({
      success: true,
      message: "Login successful",
      data: { token: "test-token" },
      statusCode: 200,
    });

    renderWithProviders(<FormLogin onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should display loading state during submission", async () => {
    const user = userEvent.setup();

    mockLogin.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Login successful",
                data: { token: "test-token" },
                statusCode: 200,
              }),
            100
          )
        )
    );

    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Signing In/i })
      ).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /Sign In/i })
        ).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it("should display error message on login failure", async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should disable inputs during loading", async () => {
    const user = userEvent.setup();

    mockLogin.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Login successful",
                data: { token: "test-token" },
                statusCode: 200,
              }),
            100
          )
        )
    );

    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it("should handle successful login and call onSuccess callback", async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();

    mockLogin.mockResolvedValueOnce({
      success: true,
      message: "Login successful",
      data: { token: "test-token" },
      statusCode: 200,
    });

    renderWithProviders(<FormLogin onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should not clear previous errors without user action", async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce(new Error("Login failed"));

    renderWithProviders(<FormLogin />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });

    expect(screen.getByText("Login failed")).toBeInTheDocument();
  });
});
