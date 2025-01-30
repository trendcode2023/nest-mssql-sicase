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
    @InjectRepository(User) private usersRepository: Repository<User>, // declaramos el el repositorio
    private readonly jwtService: JwtService, // declaramosn el jwservice
  ) {}

  async signIn(email: string, password: string, now: Date) {
    // 1. valida si existe email y password no son vacios
    if (!email || !password) return 'email y password es requerido!!';
    // 2. consulta usuario por email
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    // 3. valida si usuario existe
    if (!user) throw new BadRequestException('Su credencial es invalida!!');

    // 4. verifica si el usuario tiene 3 intentos fallidos
    const lastFailedLogin = user.lastFailedLogin
      ? new Date(user.lastFailedLogin)
      : null; // si user.lastFailedLogin existe lo convertimos a una instancia de Date sino mantine nulo
    console.log(
      'verificamos si lastFailedLogin existe de lo contrario sera nulo',
    );
    console.log('lastFailedLogin: ' + lastFailedLogin);

    const isSameDay =
      lastFailedLogin && lastFailedLogin.toDateString() === now.toDateString();
    console.log(
      'verificamos si lastFailedLogin existe, entonces comparamos con la fecha actual, de lo contrario sera false',
    );
    console.log('isSameDay: ' + isSameDay);
    // hasta ahora no guardamos nada en base de datos
    if (user.failedLoginAttempts >= 3 && isSameDay) {
      // Si el usuario tiene 3 intentos fallidos en el mismo día, bloquear la cuenta
      user.status = 'bl';
      await this.usersRepository.save(user);
      throw new BadRequestException(
        'Cuenta bloqueada por múltiples intentos fallidos',
      );
    }
    // 5. compara la contrasenia
    const isMatch = await bcrypt.compare(password, user.password);
    // 6. validad si la comparacion fue exitosa
    //if (!isMatch) throw new BadRequestException('Su credencial es invalida!!');

    if (!isMatch) {
      if (!isSameDay) {
        // Si el último intento fallido no es en el mismo día, reiniciar el contador
        user.failedLoginAttempts = 1;
        user.lastFailedLogin = now;
        console.log(now);
      } else {
        user.failedLoginAttempts++;
      }
      const validar = await this.usersRepository.save(user);
      console.log('guardamos en base de datos');
      console.log('verificra si cambia lastFailedLogin');
      console.log(validar.lastFailedLogin + '-' + validar.failedLoginAttempts);

      throw new BadRequestException('contrasenia inválida!!');
    }
    // 7. Si el inicio de sesión es exitoso, reiniciamos los intentos fallidos
    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    await this.usersRepository.save(user);
    // 8. crea el payload
    const payload = {
      id: user.id,
      dni: user.documentNum,
      email: user.email,
      roles: user.profile.name,
    };
    // 9. generamos el token
    const token = this.jwtService.sign(payload);
    // 10. actualizamos el lastlogin
    user.lastLogin = new Date();
    // 11. actualizamos en bd a lastlogin
    await this.usersRepository.save(user);
    // 12. retornamos el token
    return {
      message: 'Logged-in User',
      token,
    };
  }
  // registro del usuario
}
//    if (!user) return 'Invalid Credentials';
//    if (user.password === password) return 'Logged In';
//    return 'Invalid Credentials';

/*  async signup(user: Partial<User>) {
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
  }*/
