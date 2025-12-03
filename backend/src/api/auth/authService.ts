import { logger } from "@/server";
import { User } from "@/database/entities/userEntity";
import { UserRepository } from "./authRepository";
import bcrypt from "bcrypt";
import { env } from "@/common/utils/envConfig";
import { JwtPayload, Login } from "./authModel";
import * as jwt from "jsonwebtoken";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(data: Login): Promise<string> {
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

  async verifyToken(token: string): Promise<{
    valid: boolean;
    email?: string;
    roles?: string[];
    expiresAt?: string;
    message: string;
  }> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & {
        iat?: number;
        exp?: number;
      };

      const expiresAt = decoded.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : undefined;

      return {
        valid: true,
        email: decoded.email,
        roles: decoded.roles,
        expiresAt,
        message: "Token is valid",
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      logger.error(`Token verification failed: ${errorMsg}`);

      return {
        valid: false,
        message: errorMsg.includes("expired")
          ? "Token has expired"
          : errorMsg.includes("invalid")
          ? "Token signature is invalid or token was modified"
          : "Token verification failed",
      };
    }
  }
}
