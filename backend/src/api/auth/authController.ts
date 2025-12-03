import type { Request, RequestHandler, Response } from "express";
import SingletonDb from "@/database";
import { AuthService } from "./authService";
import { UserRepository } from "./authRepository";
import { LoginResponse, LoginSchema, VerifyTokenResponse } from "./authModel";
import z from "zod";
import { User } from "@/database/entities/userEntity";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { StatusCodes } from "http-status-codes";

class AuthController {
  private authService: AuthService;

  constructor() {
    const dataSource = SingletonDb.getConnection();
    const userRepository = new UserRepository(dataSource.getRepository(User));
    this.authService = new AuthService(userRepository);
  }

  public login: RequestHandler = async (req: Request, res: Response) => {
    try {
      const validatedBody = LoginSchema.parse(req.body);
      const result = await this.authService.login(validatedBody);

      res.cookie(env.JWT_COOKIE_NAME, result, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        maxAge: env.JWT_COOKIE_MAX_AGE,
      });

      return res.json(
        ServiceResponse.success<LoginResponse>("Login successful", {
          token: result,
        })
      );
    } catch (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ServiceResponse.failure("Internal Server Error", err));
    }
  };

  public logout: RequestHandler = async (req: Request, res: Response) => {
    try {
      const test = res.clearCookie(env.JWT_COOKIE_NAME, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
      });

      return res.json(ServiceResponse.success("Logout successful", {}));
    } catch (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ServiceResponse.failure("Internal Server Error", err));
    }
  };

  public verify: RequestHandler = async (req: Request, res: Response) => {
    try {
      const token = req.cookies[env.JWT_COOKIE_NAME];

      if (!token) return res.status(401).json({ error: "Not authenticated" });

      const result = await this.authService.verifyToken(token);

      const statusCode = result.valid
        ? StatusCodes.OK
        : StatusCodes.UNAUTHORIZED;

      return res
        .status(statusCode)
        .json(
          ServiceResponse.success<VerifyTokenResponse>(result.message, result)
        );
    } catch (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ServiceResponse.failure("Internal Server Error", err));
    }
  };
}

export const authController = new AuthController();
