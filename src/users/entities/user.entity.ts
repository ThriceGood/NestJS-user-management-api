import { IsEmail, IsStrongPassword } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../auth/entities/role.entity";
import { AbstractEntity } from "../../database/abstract.entity";

@Entity()
export class User extends AbstractEntity {

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  nickName: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  profileImage?: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;
}
