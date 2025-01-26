//import { Role } from 'src/roles.enum';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/utils/roles.enum';
//import { Role } from 'src/utils/roles.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
