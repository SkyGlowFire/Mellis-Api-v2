import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Role } from '../users/schemas/user.schema';
import { RolesGuard } from './roles.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(RolesGuard)
)