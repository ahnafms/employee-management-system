import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
} from "typeorm";
import { Role } from "./roleEntity";
import { Employee } from "./employeeEntity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  username: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ unique: true, type: "varchar" })
  email: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: "users_roles",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles: Role[];

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;
}
