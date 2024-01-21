import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role, Roles } from '../auth/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const createUserDto: CreateUserDto = {
    firstName: 'Josh',
    lastName: 'Smith',
    nickName: 'Smithy',
    email: 'smithy@mail.com',
    password: 'password'
  };
  
  const admnRoleMock: Partial<Role> = {
    name: Roles.ADMIN
  };
  
  const userRoleMock: Partial<Role> = {
    name: Roles.USER
  };
  
  let updateUserDto: UpdateUserDto;
  const hashedPassword = 'hashedPassword';
  const user = new User(); 
  let usersRepositoryMock;
  let rolesRepositoryMock;

  jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => 'salt');
  jest.spyOn(bcrypt, 'hash').mockImplementation(() => hashedPassword);

  beforeEach(async () => {

    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.nickName = createUserDto.nickName;
    user.email = createUserDto.email;
    user.password = hashedPassword;
    user.role = { name: Roles.USER } as Role;

    updateUserDto = { nickName: 'SmithyWithy' }

    usersRepositoryMock = {
      save: jest.fn(),
      findOneBy: jest.fn(() => user)
    };

    rolesRepositoryMock = {
      findOneBy: jest.fn((role: Role) => {
        if (role.name === Roles.ADMIN) {
          return admnRoleMock;
        } else if (role.name === Roles.USER) {
          return userRoleMock;
        }
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock
        },
        {
          provide: getRepositoryToken(Role),
          useValue: rolesRepositoryMock
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('usersService.create', () => {

    it ('should call usersRepository.save with user object', async () => {

      await service.create(createUserDto);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user)
    });

    it ('should raise NotFoundException if there is no USER role in database', async () => {
      rolesRepositoryMock = {
        findOneBy: jest.fn(() => null)
      }

      try {
        await service.create(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toBe(`Role with name ${Roles.USER} not found`);
      }
    })

  });

  describe('usersService.update', () => {

    it ('should call usersRepository.save with user object', async () => {
      user.nickName = 'SmithyWith';

      await service.update(1, updateUserDto);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user)
    });

    it ('should update role if role is provided in DTO', async () => {

      updateUserDto = { role: Roles.ADMIN }
      user.role = { name: Roles.ADMIN } as Role;

      await service.update(1, updateUserDto);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user)
    });

    it ('should update password if password is provided in DTO', async () => {
      updateUserDto = { password: 'newPassword' }

      await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalled
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user)
    });

    it ('should raise NotFoundException if there is no user in database', async () => {
      usersRepositoryMock = {
        findOneBy: jest.fn(() => null)
      }

      try {
        await service.update(1, updateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toBe('User with id 1 not found');
      }
    })

  });

  describe('usersService.updateProfileImage', () => {

    it ('should call usersRepository.save with user with updated image name', async () => {
      const imageName = 'profileImage';
      const updatedUser = { ...user, profileImage: imageName };

      await service.updateProfileImage(1, imageName);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(updatedUser);
    });

    it ('should raise NotFoundException if there is no user in database', async () => {
      usersRepositoryMock = {
        findOneBy: jest.fn(() => null)
      }

      try {
        await service.updateProfileImage(1, 'profileImage');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toBe('User with id 1 not found');
      }
    })

  });

});
