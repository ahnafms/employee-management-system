import { logger } from "@/server";
import { User } from "@/database/entities/userEntity";
import { UserRepository } from "./authRepository";
import bcrypt from "bcrypt";
import { env } from "@/common/utils/envConfig";
import { JwtPayload, LoginRequest } from "./authModel";
import * as jwt from "jsonwebtoken";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(data: LoginRequest): Promise<string> {
    try {
      const user = await this.userRepository.findUserByEmail(data.email);

      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const userRoles = user.roles.map((role) => role.name);

      const payload: JwtPayload = {
        email: user.email,
        roles: userRoles,
      };

      const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });

      return token;
    } catch (err) {
      const errorMessage = `Database error in findUser: ${
        (err as Error).message
      }`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async register(email: string, password: string): Promise<User | null> {
    try {
      const hashPassword = await bcrypt.hash(password, env.SALT_ROUNDS);
      const newUser: Partial<User> = {
        email,
        password: hashPassword,
      };

      const user = await this.userRepository.createUser(newUser);
      return user;
    } catch (ex) {
      const errorMessage = `Error registering user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
