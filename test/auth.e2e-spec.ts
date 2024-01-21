import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { LoginDto } from '../src/auth/dto/login.dto';
import { UsersService } from '../src/users/users.service';
import { Role, Roles } from '../src/auth/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const user: User = {
    id: 1,
    firstName:'Josh',
    lastName: 'Smith',
    nickName: 'Smithy',
    email: 'smithy@mail.com',
    password: 'hashedPassword',
    role: { name: Roles.ADMIN } as Role
  }

  let usersServiceMock;

  const jwtServiceMock = {
    signAsync: jest.fn(() => 'token')
  }

  beforeEach(async () => {

    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

    usersServiceMock = {
      findByEmailWithPassword: jest.fn(() => user)
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(UsersService)
    .useValue(usersServiceMock)
    .overrideProvider(JwtService)
    .useValue(jwtServiceMock)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/auth/login (POST)', () => {

    it ('should log in a user', () => {

      const loginDto: LoginDto = {
        email: 'smithy@mail.com',
        password: 'password'
      }

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect({ access_token: 'token' });
    });

    it ('should return 401 unauthorized if no user exists for given email', () => {

      usersServiceMock.findByEmailWithPassword = jest.fn(() => null);

      const loginDto: LoginDto = {
        email: 'nobody@mail.com',
        password: 'password'
      }

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it ('should return 401 unauthorized if password does not match', () => {

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      const loginDto: LoginDto = {
        email: 'smithy@mail.com',
        password: 'wrongPassword'
      }

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

  });

  afterAll(async () => {
    await app.close();
  });
});
