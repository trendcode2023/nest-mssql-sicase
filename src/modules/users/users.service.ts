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
import { UpdateStatus } from './dtos/UpdateStatus.dto';
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
      const profile = await this.profilesRepository.findOne({
        where: { id: user.codProfile },
      });
      if (!profile) throw new BadRequestException('perfil no existe!!');
      const hashedPassword = await bcrypt.hash(user.password, 10);

      //PasswordExpirationDate expirara en 90 dias
      const passwordExpirationDate = new Date(now);
      passwordExpirationDate.setDate(passwordExpirationDate.getDate() + 90);
      const newUser = this.usersRepository.create({
        ...user,
        documentType: user.documentType,
        password: hashedPassword,
        createAt: now,
        createdBy: id,
        updateAt: now,
        updatedBy: id,
        userExpirationDate: now,
        passwordExpirationDate,
      } as Partial<CreateUserDto>);
      const response = await this.usersRepository.save(newUser);
      await this.updateStamp(user.stampBase64,response)
      return response;
    } catch (error) {
      throw new NotFoundException(`error: ${error.message}`);
    }
  }

  async registerStamOld(stampBase64:string, entity:User){
    if (stampBase64) {
      const base64Data = stampBase64.replace(
        /^data:image\/\w+;base64,/,
        '',
      );
      const buffer = Buffer.from(base64Data, 'base64');
      const uploadDir = `D:/doctor/firmas/${entity.id}/`;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, 'firma.png');
      fs.writeFileSync(filePath, buffer);
      entity.routeStamp = uploadDir + 'firma.png';
      await this.usersRepository.update(entity.id, {
        routeStamp: entity.routeStamp,
      });
    }
  }

  async updateStamp(stampBase64: string, entity: User) {
    if (stampBase64) {
      const base64Data = stampBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const uploadDir = `D:/doctor/firmas/${entity.id}/`;
      const filePath = path.join(uploadDir, 'firma.png');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      fs.writeFileSync(filePath, buffer);
      entity.routeStamp = filePath;
      await this.usersRepository.update(entity.id, {
        routeStamp: entity.routeStamp,
      });
    }
  }

  async uploadStamp(
    idUser: string,
    now: Date,
    file: Express.Multer.File,
    username: string,
  ) {
    try {
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
      response.routeStamp = await this.getStampByUser(response.id);
      return response;
      // 1. consulta el tipo de documento por id
    } catch (error) {}
  }

  async getStampByUser(id: string) {
    //  const filePath = path.join('D:/doctor/firmas', userId, 'nombre-del-archivo.png');
    // 🔥 Cambia 'nombre-del-archivo.png' por el nombre real guardado en tu DB
    let base64Image = null;
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
      return base64Image;
    } catch (error) {
      return base64Image;
    }
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto,
    now: Date,
    username: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id }
    });
    if (!user) throw new BadRequestException('El Usuario no existe');
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    Object.assign(user, updateData);
    user.updateAt = now;
    user.updatedBy = username;
    user.password = hashedPassword
    const response =  await this.usersRepository.save(user)
    await this.updateStamp(updateData.stampBase64,response)
    return response
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
    return await this.usersRepository.find();
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
    if (filters) {
      if (filters.name) {
        query.andWhere('LOWER(user.names) LIKE :name', {
          name: `%${filters.name.toLowerCase()}%`,
        });
      }
      if (filters.email) {
        query.andWhere('LOWER(user.email) LIKE :email', {
          email: `%${filters.email.toLowerCase()}%`,
        });
      }
      if (filters.documentNum) {
        query.andWhere('user.documentNum LIKE :documentNum', {
          documentNum: `%${filters.documentNum}%`,
        });
      }
    }
    query.orderBy(`user.${'createAt'}`, order);
    query.skip((page - 1) * limit).take(limit);
    const [users, total] = await query.getManyAndCount();
    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users,
    };
  }

  async getUserById(id: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    user.routeStamp = await this.getStampByUser(user.id);
    return {
      codProfile: user.codProfile,
      documentType: user.documentType,
      documentNum: user.documentNum,
      cmp: user.cmp,
      names: user.names,
      patSurname: user.patSurname,
      matSurname: user.matSurname,
      username: user.username,
      email: user.email,
      password: user.password,
      cellphone: user.cellphone,
      routeStamp: user.routeStamp,
    };
  }

  async updateUserStatus(id: string, status:UpdateStatus, now: Date) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (user.status === status.status) {
      throw new BadRequestException(`El usuario ya está en estado "${status}"`);
    }
    user.status = status.status;
    user.updateAt = now;
    user.updatedBy = user.username;
    await this.usersRepository.save(user);
    return {
      message: `Usuario ${status.status === 'ac' ? 'activado' : 'anulado'} correctamente`,
      userId: user.id,
      status: user.status,
      updatedAt: user.updateAt,
      updatedBy: user.updatedBy,
    };
  }
  
}
