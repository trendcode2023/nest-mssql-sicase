import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Catalog } from '../catalog/catalog.entity';
import { Profile } from '../profile/profile.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';


const mockUserRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  }),
});

const mockProfileRepo = () => ({
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let profilesRepository: jest.Mocked<Repository<Profile>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: getRepositoryToken(Catalog), useValue: {} },
        { provide: getRepositoryToken(Profile), useFactory: mockProfileRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    profilesRepository = module.get(getRepositoryToken(Profile));
  });

  describe('createUser', () => {
    it('debería crear un usuario con éxito', async () => {
      const userDto: CreateUserDto = {
        username: 'testuser',
        password: '123456',
        codProfile: 'profile123',
        documentType: 'DNI',
        stampBase64: '',
      } as any;

      const now = new Date();
      const mockProfile = { id: 'profile123', name: 'admin' };
      const mockSavedUser = { id: 'user123', ...userDto };

      profilesRepository.findOne.mockResolvedValue(mockProfile as Profile);
      usersRepository.create.mockReturnValue(mockSavedUser as any);
      usersRepository.save.mockResolvedValue(mockSavedUser as any);

      const result = await service.createUser(userDto, now, 'admin-id');

      expect(profilesRepository.findOne).toHaveBeenCalledWith({ where: { id: 'profile123' } });
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(mockSavedUser);
      expect(result).toEqual(mockSavedUser);
    });

    it('debería lanzar error si no se encuentra el perfil', async () => {
      profilesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createUser({ codProfile: 'x', password: '123456' } as any, new Date(), 'admin-id'),
      ).rejects.toThrow('perfil no existe!!');
    });

    it('debería lanzar error si no se proporciona contraseña', async () => {
      profilesRepository.findOne.mockResolvedValue({ id: 'profile1' } as Profile);

      await expect(
        service.createUser({ codProfile: 'x' } as any, new Date(), 'admin-id'),
      ).rejects.toThrow('Contraseña es requerido');
    });
  });

  describe('updateUser', () => {
    it('debería actualizar un usuario con éxito', async () => {
      const id = 'user123';
      const now = new Date();
      const username = 'admin';
      const existingUser = {
        id,
        username: 'olduser',
        updateAt: null,
        updatedBy: null,
      };
      const updateData = {
        username: 'newuser',
        stampBase64: '',
        
      };
  
      usersRepository.findOne.mockResolvedValue(existingUser as any);
      usersRepository.save.mockResolvedValue({
        ...(existingUser as any),
        ...updateData,
      });
      jest.spyOn(service as any, 'updateStamp').mockResolvedValue(undefined);
  
      const result = await service.updateUser(id, updateData as any, now, username);
  
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(usersRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        ...updateData,
        updateAt: now,
        updatedBy: username,
      });
      expect(result).toBeDefined()
    });
  
    it('debería lanzar error si el usuario no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);
  
      await expect(
        service.updateUser('invalid-id', {} as any, new Date(), 'admin'),
      ).rejects.toThrow('El Usuario no existe');
    });
  });

  describe('uploadStamp', () => {
    const idUser = 'user123';
    const now = new Date();
    const file = {
      originalname: 'firma.png',
      buffer: Buffer.from('fake-file-content'),
    } as Express.Multer.File;
  
    const username = 'admin';
  
    it('debería guardar la firma y actualizar el usuario', async () => {
      const userMock = { id: idUser };
  
      usersRepository.findOne.mockResolvedValue(userMock as any);
      usersRepository.save.mockResolvedValue({ ...(userMock as any), routeStamp: 'ruta/firma.png' });
  
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
      jest.spyOn(service, 'getStampByUser').mockResolvedValue('base64image');
  
      const result = await service.uploadStamp(idUser, now, file, username);
  
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: idUser } });
      expect(usersRepository.save).toHaveBeenCalled();
      expect(result.routeStamp).toBe('base64image');
    });
  
    it('debería lanzar error si el usuario no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);
  
      await expect(service.uploadStamp(idUser, now, file, username)).rejects.toThrow('Usuario no existe!!');
    });
  });


describe('getUsersPaginated', () => {
    it('debería retornar usuarios paginados con filtros', async () => {
      const mockedBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: '1' }], 1]),
      };
  
      usersRepository.createQueryBuilder.mockReturnValue(mockedBuilder);
  
      const result = await service.getUsersPaginated(1, 10, {
        name: 'juan',
        email: 'mail',
        documentNum: '1234',
      });
  
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 1,
        users: [{ id: '1' }],
      });
  
      expect(mockedBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockedBuilder.orderBy).toHaveBeenCalledWith('user.createAt', 'DESC');
    });
  });

  describe('updateUserStatus', () => {
    const now = new Date();
    const id = 'user123';
  
    it('debería actualizar el estado del usuario con éxito', async () => {
      const userMock = {
        id,
        username: 'admin',
        status: 'in',
        updateAt: null,
        updatedBy: null,
      };
  
      usersRepository.findOne.mockResolvedValue(userMock as any);
      usersRepository.save.mockResolvedValue({ ...(userMock as any), status: 'ac' });
  
      const result = await service.updateUserStatus(id, { status: 'ac' }, now);
  
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(usersRepository.save).toHaveBeenCalledWith({
        ...userMock,
        status: 'ac',
        updateAt: now,
        updatedBy: userMock.username,
      });
  
      expect(result.message).toContain('activado');
    });
  
    it('debería lanzar error si el usuario no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);
  
      await expect(service.updateUserStatus(id, { status: 'ac' }, now)).rejects.toThrow('Usuario no encontrado');
    });
  
    it('debería lanzar error si el usuario ya tiene el estado', async () => {
      const userMock = {
        id,
        username: 'admin',
        status: 'ac',
      };
  
      usersRepository.findOne.mockResolvedValue(userMock as any);
  
      await expect(service.updateUserStatus(id, { status: 'ac' }, now)).rejects.toThrow('El usuario ya está en estado');
    });
  });
  
});


