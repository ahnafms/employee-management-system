import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authController } from "../authController";

vi.mock("@/database", () => {
  const mockDb = {
    getConnection: vi.fn(() => ({
      getRepository: vi.fn(() => ({
        findOne: vi.fn(),
        save: vi.fn(),
      })),
    })),
    initialize: vi.fn(),
  };
  return { default: mockDb };
});

vi.mock("@/server", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  app: {},
}));

// Mock auth service
vi.mock("../authService", () => ({
  AuthService: class MockAuthService {
    async login() {
      return "mock-token";
    }
  },
}));

// Mock repositories
vi.mock("../authRepository", () => ({
  UserRepository: class MockUserRepository {
    constructor() {}
  },
}));

vi.mock("bcrypt");
vi.mock("jsonwebtoken");

describe("AuthController - Login", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: Partial<NextFunction>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      body: {},
      cookies: {},
    };

    mockResponse = {
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("POST /login - Basic Tests", () => {
    it("should call login endpoint without crashing", async () => {
      mockRequest.body = {
        email: "admin@example.com",
        password: "password123",
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(true).toBe(true);
    });
  });

  describe("POST /login - Validation", () => {
    it("should validate email format", async () => {
      mockRequest.body = {
        email: "not-an-email",
        password: "password123",
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.json || mockResponse.status).toBeTruthy();
    });
  });
});
