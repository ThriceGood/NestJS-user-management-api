import { SetMetadata } from '@nestjs/common';
import { Roles } from '../entities/role.entity';

export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
