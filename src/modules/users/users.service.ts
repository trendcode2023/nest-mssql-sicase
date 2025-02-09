import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Catalog } from '../catalog/catalog.entity';
import { Profile } from '../profile/profile.entity';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UpdateUserByDoctorDto } from './dtos/updateUserDoctor.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
  ) {}

  async createUser(
    user: CreateUserDto,
    now: Date,
    id: string, //
  ): Promise<CreateUserDto> {
    try {
      console.log(id);
      // 1. consulta el tipo de documento por id
      const documentType = await this.catalogsRepository.findOne({
        where: { id: user.documentType },
      });

      // 2. valida si existe el tipo de documento
      if (!user) throw new BadRequestException('tipo de documento no existe!!');

      // 3. consulta el perfil por id
      const profile = await this.profilesRepository.findOne({
        where: { id: user.codprofile },
      });

      // 4. valida si existe el perfil
      if (!profile) throw new BadRequestException('perfil no existe!!');

      // 5. encripta el password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // 6. passwordExpirationDate expirara en 90 dias
      const passwordExpirationDate = new Date(now);
      passwordExpirationDate.setDate(passwordExpirationDate.getDate() + 90);
      // 7. crea la instancia de user
      const newUser = this.usersRepository.create({
        // ...userWithoutCodProfile,
        ...user,
        documentType: String(documentType.id),
        password: hashedPassword,
        //status esta por defecto 1
        //lastLogin: now,
        //availableLoginNumber =1
        // loginNumberUsed = 1
        createAt: now,
        createdBy: id,
        updateAt: now,
        updatedBy: id,
        userExpirationDate: now,
        // userExpirationFlag
        passwordExpirationDate,
        //passwordExpirationFlag

        profile: profile,
      } as Partial<CreateUserDto>);

      // 8. guarda en bd el nuevo usuario y lo retorna
      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new NotFoundException(`error: ${error.message}`);
    }

    //base64 string (colocar en el dto), guardas ruta en un campo de la tabla. d:/doctor+/firmas/idusuario/firmas/
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto,
    now: Date,
    username: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) throw new BadRequestException('Usuario no existe!!');
    user.updateAt = now;

    user.updatedBy = username;

    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  // funcion elimiar, cmabiariamos el estado del usuario.

  async updateUserByDoctor(
    id: string,
    updateData: UpdateUserByDoctorDto,
    now: Date,
    username: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) throw new BadRequestException('Usuario no existe!!');

    // pendiente hashear el password
    user.updateAt = now;
    user.updatedBy = username;
    console.log(user.updatedBy);
    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }
  async getAllUsers() {
    // codigo frank
    // no esta devolviendo correctamente las autorizaciones
    /* return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.authorizations', 'authorization')
      .leftJoinAndSelect('authorization.route', 'route')
      .getMany();*/
    return await this.usersRepository.find({
      //relations: ['profile.authorizations'],
    });
  }
}
