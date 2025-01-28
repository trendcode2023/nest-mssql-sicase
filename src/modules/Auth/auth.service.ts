import {
  BadRequestException,
  Injectable,
  //NotFoundException,
} from '@nestjs/common';
//import { UsersRepository } from 'src/Users/users.repository';
import * as bcrypt from 'bcrypt';

//import { Users } from 'src/Users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    // 1. valida si existe email y password no son vacios
    if (!email || !password) return 'email y password es requerido!!';
    // 2. consulta usuario por email
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    console.log(user);
    // 3. valida si usuario existe
    if (!user) throw new BadRequestException('Su credencial es invalida!!');
    // 4. compara la contrasenia
    const isMatch = await bcrypt.compare(password, user.password);
    // 5. validad si la comparacion fue exitosa
    if (!isMatch) throw new BadRequestException('Su credencial es invalida!!');

    // 6. crea el payload
    const payload = {
      id: user.id,
      dni: user.documentNum,
      email: user.email,
      roles: user.profile.name,
    };

    // 7. generamos el token
    const token = this.jwtService.sign(payload);
    // 8. actualizamos el lastlogin
    user.lastLogin = new Date();
    await this.usersRepository.save(user);
    // 9. retornamos el token
    return {
      message: 'Logged-in User',
      token,
    };
  }
  // registro del usuario
  async signup(user: Partial<User>) {
    const { email, password } = user;
    if (!email || !password) throw new BadRequestException('Data is required');
    const foundUser = await this.usersRepository.findOneBy({ email });
    if (foundUser) throw new BadRequestException('email is registered');

    // proceso de registro
    // hashear la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // guardar el usuario en la bd
    return await this.usersRepository.create({
      ...user,
      password: hashedPassword,
    });
  }

  getAuth() {
    return 'auth list';
  }
}
//    if (!user) return 'Invalid Credentials';
//    if (user.password === password) return 'Logged In';
//    return 'Invalid Credentials';
