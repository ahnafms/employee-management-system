import type { Request, RequestHandler, Response } from "express";
import SingletonDb from "@/database";
import { AuthService } from "./authService";
import { UserRepository } from "./authRepository";
import { LoginResponse, LoginSchema } from "./authModel";
import z from "zod";
import { User } from "@/database/entities/userEntity";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";

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
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request",
          errors: err.issues,
        });
      }
      return res.status(500).json({ message: (err as Error).message });
    }
  };
}

export const authController = new AuthController();
