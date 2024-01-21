import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './entities/role.entity';

export type JwtPayload = {
  sub: number,
  email: string,
  role: Roles
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(email: string, givenPassword: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatch = await bcrypt.compare(givenPassword, user?.password);

    if (!passwordMatch) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email,
      role: user.role.name
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
