import { StatusCodes } from "http-status-codes";

import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { User } from "@/database/entities/userEntity";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findAll(): Promise<User[] | null> {
    try {
      const users = await this.userRepository.findAllAsync();
      if (users.length === 0) {
        return null;
      }
      return users;
    } catch (err) {
      const errorMessage = `Database error in findAll: ${
        (err as Error).message
      }`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async findById(id: number): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
