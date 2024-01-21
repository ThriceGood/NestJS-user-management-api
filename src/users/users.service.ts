import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, Roles } from '../auth/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const role = await this.rolesRepository.findOneBy({ name: Roles.USER })

    if (!role) {
      throw new NotFoundException(`Role with name ${Roles.USER} not found`)
    }

    const user = new User();

    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.nickName = createUserDto.nickName;
    user.email = createUserDto.email;
    user.role = role;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(createUserDto.password, salt);

    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const user = await this.usersRepository
                           .createQueryBuilder('u')
                           .addSelect('u.password')
                           .where("u.email = :email", { email })
                           .setFindOptions({ loadEagerRelations: true })
                           .getOne()

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findUser(id);

    user.firstName = updateUserDto.firstName ?? user.firstName;
    user.lastName = updateUserDto.lastName ?? user.lastName;
    user.nickName = updateUserDto.nickName ?? user.nickName;
    user.email = updateUserDto.email ?? user.email;

    if (updateUserDto.role) {
      const role = await this.rolesRepository.findOneBy({ name: updateUserDto.role })
      user.role = role;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.usersRepository.save(user);
  }

  async updateProfileImage(id: number, imageName: string): Promise<User | null> {
    const user = await this.findUser(id);

    user.profileImage = imageName;

    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    await this.usersRepository.delete({ id });
  }

  private async findUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return user;
  }
}
