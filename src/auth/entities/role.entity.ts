import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { AbstractEntity } from "../../database/abstract.entity";

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

@Entity()
export class Role extends AbstractEntity {

  @Column({ unique: true })
  name: Roles;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}