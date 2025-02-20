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
import * as fs from 'fs';
import * as path from 'path';
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
    // file: Express.Multer.File,
  ) {
    try {
      // Guardar imagen en una carpeta
      // const uploadDir = `D:/doctor/firmas/${id}/`;
      // if (!fs.existsSync(uploadDir)) {
      //   fs.mkdirSync(uploadDir, { recursive: true });
      // }

      // const filePath = path.join(uploadDir, file.originalname);
      //  fs.writeFileSync(filePath, file.buffer);
      //  console.log(id);
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
        //   routeStamp: filePath,
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
       const response = await this.usersRepository.save(newUser);

       if(user.stampBase64){
          const base64Data = user.stampBase64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          const uploadDir = `D:/doctor/firmas/${response.id}/`;
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, 'firma.png');
          fs.writeFileSync(filePath, buffer);
      }
      return response;
    } catch (error) {
      throw new NotFoundException(`error: ${error.message}`);
    }

    //base64 string (colocar en el dto), guardas ruta en un campo de la tabla. d:/doctor+/firmas/idusuario/firmas/
  }

  async uploadStamp(
    idUser: string,
    now: Date,
    file: Express.Multer.File,
    username: string,
  ) {
    try {
      // 1. consulta si esxite el usuario
      const user = await this.usersRepository.findOne({
        where: { id: idUser },
      });
      // 2. si no existe manda excepcion
      if (!user) throw new BadRequestException('Usuario no existe!!');
      // 3. Guardar imagen en una carpeta
      const uploadDir = `D:/doctor/firmas/${idUser}/`;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      console.log(filePath);
      console.log(now);
      console.log(username);
      //user.routeStamp = filePath;
      //user.updateAt = now;
      //user.updatedBy = username;
      Object.assign(user, {
        // ...questData,
        routeStamp: filePath,
        updateAt: now,
        updatedBy: username,
      });
      const response = await this.usersRepository.save(user);
      response.routeStamp = await this.getStampByUser(response.id)
      return response;
      // 1. consulta el tipo de documento por id
    } catch (error) {}
  }

  async getStampByUser(id:string){
  //  const filePath = path.join('D:/doctor/firmas', userId, 'nombre-del-archivo.png'); 
    // 🔥 Cambia 'nombre-del-archivo.png' por el nombre real guardado en tu DB
    let base64Image=null;
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user || !user.routeStamp) {
        return base64Image;
      }
      const filePath = user.routeStamp; 
      if (!fs.existsSync(filePath)) {
        return base64Image;
      }
      const fileBuffer = fs.readFileSync(filePath);
      base64Image = fileBuffer.toString('base64');
      return base64Image
    } catch (error) {
      return base64Image
    }
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

   /**
   * Método para obtener usuarios con paginación y filtros dinámicos
   * @param page Número de página
   * @param limit Cantidad de registros por página
   * @param filters Filtros opcionales para buscar por nombre, email o documento
   * @param sortBy Campo por el cual ordenar
   * @param order Orden de la consulta (ASC o DESC)
   * @returns Lista paginada de usuarios con metadata
   */
   async getUsersPaginated(
    page: number = 1, // Página por defecto 1
    limit: number = 10, // 10 registros por defecto
    filters?: { name?: string; email?: string; documentNum?: string },
  //  sortBy: keyof User = 'createAt', // Ordenar por fecha de creación por defecto
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = this.usersRepository.createQueryBuilder('user');

    // Aplicar filtros dinámicos
    if (filters) {
      if (filters.name) {
        query.andWhere('LOWER(user.names) LIKE :name', { name: `%${filters.name.toLowerCase()}%` });
      }
      if (filters.email) {
        query.andWhere('LOWER(user.email) LIKE :email', { email: `%${filters.email.toLowerCase()}%` });
      }
      if (filters.documentNum) {
        query.andWhere('user.documentNum LIKE :documentNum', { documentNum: `%${filters.documentNum}%` });
      }
    }

    query.orderBy(`user.${'createAt'}`, order);

    // Aplicar paginación
    query.skip((page - 1) * limit).take(limit);

    // Obtener datos
    const [users, total] = await query.getManyAndCount();

    // Retornar datos con metadata
    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users,
    };
  }
  
  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['profile'],});
    if (!user) throw new BadRequestException('Usuario no encontrado');
    user.routeStamp= await this.getStampByUser(user.id)
    return user;
  }
}
