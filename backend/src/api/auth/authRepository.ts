import { User } from "@/database/entities/userEntity";
import { Repository } from "typeorm";

export class UserRepository {
  private readonly userRepository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.userRepository = repository;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async createUser(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }
}
