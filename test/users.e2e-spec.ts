import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Role, Roles } from '../src/auth/entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../src/auth/auth.service';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { ProfileImagePipe } from '../src/users/pipes/profile.image.pipe';

describe('UsersController (e2e)', () => {
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

  let userRepositoryMock = {
    save: jest.fn(),
    find: jest.fn(() => [user]),
    findOneBy: jest.fn(() => user),
    delete: jest.fn()
  };

  const admnRoleMock: Partial<Role> = {
    name: Roles.ADMIN
  };
  
  const userRoleMock: Partial<Role> = {
    name: Roles.USER
  };

  const rolesRepositoryMock = {
    findOneBy: jest.fn((role: Role) => {
      if (role.name === Roles.ADMIN) {
        return admnRoleMock;
      } else if (role.name === Roles.USER) {
        return userRoleMock;
      }
    })
  };

  let jwtPayload: JwtPayload;
  let jwtServiceMock;

  beforeEach(async () => {

    jwtPayload = { 
      sub: user.id, 
      email: user.email, 
      role: Roles.ADMIN 
    }

    jwtServiceMock = {
      verifyAsync: jest.fn(() => jwtPayload)
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(User))
    .useValue(userRepositoryMock)
    .overrideProvider(getRepositoryToken(Role))
    .useValue(rolesRepositoryMock)
    .overrideProvider(JwtService)
    .useValue(jwtServiceMock)
    .overridePipe(ProfileImagePipe)
    .useValue({ transform: jest.fn(() => 'myimage') })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/users (POST)', () => {

    it ('should create a new user', () => {

      const createUserDto: CreateUserDto = {
        firstName:'Josh',
        lastName: 'Smith',
        nickName: 'Smithy',
        email: 'smithy@mail.com',
        password: 'password',
      }

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
    });

  });

  describe('/users (GET)', () => {

    it ('should return 401 unauthorized if not logged in', () => {

      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });

    it ('should return 403 forbidden if logged in as USER', () => {

      jwtPayload.role = Roles.USER;
      
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer token')
        .expect(403);
    });

    it ('should return list of users if logged in as ADMIN', () => {

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect([user]);
    });

  });

  describe('/users/:id (GET)', () => {

    it ('should return 401 unauthorized if not logged in', () => {
      
      return request(app.getHttpServer())
        .get('/users/1')
        .expect(401);
    });

    it ('should return 403 forbidden if attempting to view use other than self when USER', () => {

      jwtPayload.role = Roles.USER;

      return request(app.getHttpServer())
        .get('/users/2')
        .set('Authorization', 'Bearer token')
        .expect(403);
    });

    it ('should return 200 ok if attempting to view use other than self when ADMIN', () => {

      return request(app.getHttpServer())
        .get('/users/2')
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

    it ('should return 200 ok if attempting to view self when USER', () => {

      jwtPayload.role = Roles.USER;

      return request(app.getHttpServer())
        .get('/users/1')
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

  });

  describe('/users/:id (PATCH)', () => {

    let updateUserDto: UpdateUserDto = {
      nickName: 'SmithyWithy'
    }

    it ('should update the user', () => {

      return request(app.getHttpServer())
        .patch('/users/1')
        .send(updateUserDto)
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

    it ('should return 403 forbidden if attempting update user other than self when USER', () => {

      jwtPayload.role = Roles.USER;

      return request(app.getHttpServer())
        .patch('/users/2')
        .send(updateUserDto)
        .set('Authorization', 'Bearer token')
        .expect(403);
    });

    it ('should return 200 ok if attempting update user other than self when ADMIN', () => {

      return request(app.getHttpServer())
        .patch('/users/2')
        .send(updateUserDto)
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

    it ('should return 200 ok if attempting update self when USER', () => {

      jwtPayload.role = Roles.USER;

      return request(app.getHttpServer())
        .patch('/users/1')
        .send(updateUserDto)
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

  });

  describe('/users/:id (DELETE)', () => {
    
    it ('should delete the user', () => {

      return request(app.getHttpServer())
        .delete('/users/2')
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

    it ('should return 403 forbidden when attempting to delete self', () => {

      return request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', 'Bearer token')
        .expect(403);
    });

    it ('should return 403 forbidden when USER', () => {

      jwtPayload.role = Roles.USER;

      return request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', 'Bearer token')
        .expect(403);
    });

  });

  describe('/users/image (POST)', () => {

    it ('should upload the image if USER', () => {
      
      jwtPayload.role = Roles.USER;
      const savedUser = { ...user, profileImage: 'myimage' }
      userRepositoryMock.save = jest.fn(() => savedUser);

      return request(app.getHttpServer())
          .post('/users/image')
          .send({image: 'myimage'})
          .set('Authorization', 'Bearer token')
          .expect(201);
    });

    it ('should return 403 forbidden if ADMIN', () => {

      return request(app.getHttpServer())
          .post('/users/image')
          .send({image: 'myimage'})
          .set('Authorization', 'Bearer token')
          .expect(403);
    });

  });

  afterAll(async () => {
    await app.close();
  });
});
