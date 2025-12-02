import { User } from "@/database/entities/userEntity";
import { DataSource, Repository } from "typeorm";

export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async findAllAsync(): Promise<User[]> {
    return this.find();
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return this.findOneBy({ id });
  }

  async createAsync(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async updateAsync(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.findOneBy({ id });
    if (!user) return null;
    Object.assign(user, userData);
    return this.save(user);
  }

  async deleteAsync(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected !== 0;
  }
}
