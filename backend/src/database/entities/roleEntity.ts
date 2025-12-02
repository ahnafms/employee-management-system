import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { User } from "./userEntity";

@Entity({ name: "roles" })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
