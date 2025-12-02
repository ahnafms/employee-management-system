import type { Request, RequestHandler, Response } from "express";
import SingletonDb from "@/database";
import { AuthService } from "./authService";
import { UserRepository } from "./authRepository";
import { LoginSchema } from "./authModel";
import z from "zod";
import { User } from "@/database/entities/userEntity";
import { ServiceResponse } from "@/common/models/serviceResponse";

class AuthController {
  private authService: AuthService;

  constructor() {
    const dataSource = SingletonDb.getConnection();
    const userRepository = new UserRepository(dataSource.getRepository(User));
    this.authService = new AuthService(userRepository);
  }

  public login: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const validatedBody = LoginSchema.parse(_req.body);
      const result = await this.authService.login(validatedBody);
      return ServiceResponse.success<string>("Login successful", result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request",
          errors: err.errors,
        });
      }
    }
  };
}

export const authController = new AuthController();
