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

  getAuth() {
    return 'auth list';
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

  async signIn(email: string, password: string) {
    console.log('signing in');
    if (!email || !password) return 'Data is required';

    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
    console.log(user);
    console.log(user.profile.name);
    if (!user) throw new BadRequestException('Invalid Credentials');
    // compracion de contrase;as
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new BadRequestException('Invalid Credentials');

    // fira del token
    //const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };

    const payload = {
      id: user.id,
      email: user.email,
      profile: user.profile.name,
    };

    // generamos el token
    const token = this.jwtService.sign(payload);
    // entregamos la respuesta
    return {
      message: 'Logged-in User',
      token,
    };
  }
}
//    if (!user) return 'Invalid Credentials';
//    if (user.password === password) return 'Logged In';
//    return 'Invalid Credentials';
