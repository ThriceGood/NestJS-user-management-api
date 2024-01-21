import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('UsersController', () => {
  let controller: AuthController;
  
  const authServiceMock = {
    login: jest.fn()
  }

  const loginDto: LoginDto = {
    email: 'smithy@mail.com',
    password: 'password'
  }
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('authController', () => {

    it ('should call authService.login with email and password', async () => {

      await controller.login(loginDto);

      expect(authServiceMock.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

  });

});
