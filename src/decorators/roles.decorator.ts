import { SetMetadata } from '@nestjs/common';
//import { Role } from 'src/utils/roles.enum';

//export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
