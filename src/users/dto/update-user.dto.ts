import { IsEmail, IsOptional } from 'class-validator';
import { Roles } from '../../auth/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
        
    @ApiProperty()
    firstName?: string;
    
    @ApiProperty()
    lastName?: string;
    
    @ApiProperty()
    nickName?: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty()
    password?: string;

    @ApiProperty({ enum: Roles })
    role?: Roles;
}
