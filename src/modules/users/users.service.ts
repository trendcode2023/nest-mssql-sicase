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
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
  ) {}

  async createUser(
    user: CreateUserDto,
    now: string,
    id: string, //
  ): Promise<CreateUserDto> {
    try {
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

      // 6. excluye la propiedad codprofile y crea el nuevo usuario
      //  const { codprofile, ...userWithoutCodProfile } = user;
      //  console.log(codprofile);
      // 7. crea el nuevo usuario
      const newUser = this.usersRepository.create({
        // ...userWithoutCodProfile,
        ...user,
        documentType: String(documentType.id),
        password: hashedPassword,
        //status esta por defecto 1
        lastLogin: now,
        //availableLoginNumber =1
        // loginNumberUsed = 1
        createAt: now,
        createdBy: id,
        updateAt: now,
        updatedBy: id,
        userExpirationDate: now,
        // userExpirationFlag
        passwordExpirationDate: now,
        //passwordExpirationFlag

        profile: profile,
      } as Partial<CreateUserDto>);

      console.log(newUser);
      // 7. guarda en bd el nuevo usuario y lo retorna
      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new NotFoundException(`error: ${error.message}`);
    }
  }

  async getAllUsers() {
    return await this.usersRepository.find({
      relations: ['profile'],
    });
  }
}
