import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, JwtPayload } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './entities/role.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersService', () => {
  let service: AuthService;

  const user = {
    id: 1,
    email: 'smithy@mail.com',
    password: 'hashedPassword',
    role: { name: Roles.ADMIN }
  };
  
  let userServiceMock;

  const jwtServiceMock = {
    signAsync: jest.fn(() => 'token')
  };

  beforeEach(async () => {

    userServiceMock = {
      findByEmailWithPassword: jest.fn(() => user)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: userServiceMock
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('authService.login', () => {

    it ('should return an access token if email and password match', async () => {

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const result = await service.login(user.email, 'password');

      const expectedPayload: JwtPayload = { 
        sub: +user.id, 
        email: user.email,
        role: user.role.name
      };

      expect(result).toEqual({ access_token: 'token' })
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(expectedPayload);
    });

    it ('should raise UnauthorizedException if no user', async () => {
      
      userServiceMock.findByEmailWithPassword = jest.fn(() => null);
      
      try {
        await service.login('idontexist@mail.com', 'password');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it ('should raise UnauthorizedException if password doesnt match', async () => {
      
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      
      try {
        await service.login(user.email, 'wrongPassword');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

  });

});
