import type { Request, RequestHandler, Response } from "express";
import { UserService } from "./userService";
import { UserRepository } from "./userRepository";
import SingletonDb from "@/database";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { User, UserSchema } from "./userModel";
import { logger } from "@/server";

class UserController {
  private userService: UserService;

  constructor() {
    const dataSource = SingletonDb.getConnection();
    this.userService = new UserService(new UserRepository(dataSource));
  }

  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const users = await this.userService.findAll();

      const userDTOs = users?.map((user) => UserSchema.parse(user)) || [];

      const response = ServiceResponse.success<User[]>("User found", userDTOs);
      res.status(response.statusCode).send(response);
    } catch (err) {
      const errorMessage = `Error retrieving users: ${(err as Error).message}`;
      const response = ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        500
      );
      res.status(response.statusCode).send(response);
    }
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await this.userService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const userController = new UserController();
