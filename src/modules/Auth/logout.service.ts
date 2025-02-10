import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    //NotFoundException,
  } from '@nestjs/common';
  //import { UsersRepository } from 'src/Users/users.repository';
  import * as bcrypt from 'bcrypt';
  
  //import { Users } from 'src/Users/user.entity';
  import { JwtService } from '@nestjs/jwt';
  import { User } from '../users/users.entity';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { LoguinUserDto } from '../users/dtos/loguinUser.dto';
  import { MfaUser } from '../users/dtos/mfaUser.dto';
  import { MfaAuthenticationService } from './mfa-authentication.service';
  
  @Injectable()
  export class LogoutService {
    constructor(
    ) {}
    
    private blacklist: Set<string> = new Set();

    async logout(token: string): Promise<string> {
        this.blacklist.add(token); // Agregar el token a la lista negra
        return 'Sesión cerrada exitosamente.';
    }
    
    isTokenBlacklisted(token: string): boolean {
        return this.blacklist.has(token);
    }
  
  }