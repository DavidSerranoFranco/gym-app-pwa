import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../schemas/user.schema';

// Esta es la "llave" para guardar los roles
export const ROLES_KEY = 'roles';

// Este es el decorador (@Roles) que usaremos en los controladores
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);