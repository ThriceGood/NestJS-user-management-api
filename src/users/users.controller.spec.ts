import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Roles } from '../auth/entities/role.entity';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const createUserDto: CreateUserDto = { 
    firstName: 'Josh', 
    lastName: 'Smith', 
    nickName: 'Smithy', 
    email: 'smithy@mail.com', 
    password: 'password' 
  };

  const userWithProfileImageMock = { profileImage: 'profileImage' };

  const usersServiceMock ={
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateProfileImage: jest.fn(() => userWithProfileImageMock)
  };

  let requestMock: Request;
  
  beforeEach(async () => {

    requestMock = {
      user: { sub: 1, role: Roles.ADMIN }
    } as unknown as Request;
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock
        }
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('usersController', () => {

    it ('should call usersService.create with given DTO when create is called', async () => {
      
      await controller.create(createUserDto);
      
      expect(usersServiceMock.create).toHaveBeenCalledWith(createUserDto);
    });

    it ('should call usersService.findAll when findAll is called', async () => {
      
      await controller.findAll();
      
      expect(usersServiceMock.findAll).toHaveBeenCalled;
    });

    it ('should call usersService.updateProfileImage with image name when uploadProfileImage is called', async () => {
      const imageName = userWithProfileImageMock.profileImage;
      const id = requestMock['user'].sub;

      await controller.uploadProfileImage(imageName, requestMock);
      
      expect(usersServiceMock.updateProfileImage).toHaveBeenCalledWith(id, imageName);
    });

  });

  describe('usersController.findOne', () => {

    it ('should call usersService.findOne with id if user is ADMIN and accesses other user', async () => {
      const id = 2;
      
      await controller.findOne(id, requestMock);
      
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(id);
    });

    it ('should call usersService.findOne with id if user is USER and accesses self', async () => {
      const id = 2;
      requestMock['user'] = { sub: id, role: Roles.USER };

      await controller.findOne(id, requestMock);
      
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(id);
    });

    it ('should raise UnauthorizedException if user is USER and accesses other user', async () => {
      const id = 1;
      requestMock['user'] = { sub: 2, role: Roles.USER };

      try {
        await controller.findOne(id, requestMock);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

  });

  describe('usersController.update', () => {

    it ('should call usersService.update with given DTO if user is ADMIN and accesses other user', async () => {
      const id = 2;
      const updateUserDto = { nickName: 'SmithyWithy' };

      await controller.update(id, updateUserDto, requestMock);

      expect(usersServiceMock.update).toHaveBeenCalledWith(id, updateUserDto);
    });

    it ('should call usersService.update with given DTO if user is USER and accesses self', async () => {
      const id = 2;
      const updateUserDto = { nickName: 'SmithyWithy' };
      requestMock['user'] = { sub: 2, role: Roles.USER };

      await controller.update(id, updateUserDto, requestMock);

      expect(usersServiceMock.update).toHaveBeenCalledWith(id, updateUserDto);
    });

    it ('should raise ForbiddenException if user is USER and accesses other user', async () => {
      const id = 1;
      const updateUserDto = { nickName: 'SmithyWithy' };
      requestMock['user'] = { sub: 2, role: Roles.USER };

      try {
        await controller.update(id, updateUserDto, requestMock);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

  });

  describe('usersController.remove', () => {

    it ('should call usersService.remove with id when remove is called and not deleting self', async () => {
      const id = 2;

      await controller.remove(id, requestMock);

      expect(usersServiceMock.remove).toHaveBeenCalledWith(id)
    });

    it ('should raise ForbiddenError when deleting self', async () => {
      try {
        await controller.remove(1, requestMock);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

  });

});
