import { Test, TestingModule } from '@nestjs/testing';
import { QuestService } from './quest.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quest } from './quest.entity';
import { User } from '../users/users.entity';
import { Catalog } from '../catalog/catalog.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { UpdateQuestDto } from './dtos/updateQuest.dto';
import { QuestResponseDto } from './dtos/QuestResponse.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('QuestService', () => {
  let service: QuestService;
  let questsRepository: jest.Mocked<Repository<Quest>>;
  let usersRepository: jest.Mocked<Repository<User>>;
  let catalogsRepository: jest.Mocked<Repository<Catalog>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestService,
        {
          provide: getRepositoryToken(Quest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Catalog),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestService>(QuestService);
    questsRepository = module.get(getRepositoryToken(Quest));
    usersRepository = module.get(getRepositoryToken(User));
    catalogsRepository = module.get(getRepositoryToken(Catalog));
  });
  describe('createQuest', () => {
    it('debería crear un cuestionario exitosamente', async () => {
      const userId = 'user123';
      const now = new Date();

      const userMock = { id: userId, username: 'doctor01' } as User;
      const questTypeMock = { id: 'type1' } as Catalog;
      const questDto: CreateQuestDto = {
        questType: 'type1',
        patientName: 'John Doe',
        patientDni: '12345678',
        jsonQuest: '{}',
        pdfName: 'quest.pdf',
      };

      const questMock = {
        ...questDto,
        createAt: now,
        createdBy: userMock.username,
        updateAt: now,
        updatedBy: userMock.username,
        user: userMock,
      };

      usersRepository.findOne.mockResolvedValue(userMock);
      catalogsRepository.findOne.mockResolvedValue(questTypeMock);
      questsRepository.create.mockReturnValue(questMock as Quest);
      questsRepository.save.mockResolvedValue(questMock as Quest);

      const result = await service.createQuest(questDto, userId, now);
      expect(result).toEqual(questMock);
      expect(questsRepository.save).toHaveBeenCalledWith(questMock);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createQuest(
          { questType: '1' } as CreateQuestDto,
          'badUserId',
          new Date(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si el tipo de cuestionario no existe', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'u1',
        username: 'test',
      } as User);
      catalogsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createQuest(
          { questType: 'invalidType' } as CreateQuestDto,
          'u1',
          new Date(),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
  describe('updateQuest', () => {
    it('debería actualizar exitosamente el cuestionario', async () => {
      const questId = 'quest1';
      const userId = 'user1';
      const now = new Date();
      const userMock = { id: userId, username: 'doctorX' } as User;
      const questMock = {
        id: questId,
        updateAt: null,
        updatedBy: '',
      } as Quest;
      const updateData: UpdateQuestDto = {
        patientName: 'Jane Doe',
      };

      questsRepository.findOne.mockResolvedValueOnce(questMock); // quest
      usersRepository.findOne.mockResolvedValueOnce(userMock); // user
      questsRepository.save.mockResolvedValue({
        ...questMock,
        ...updateData,
        updateAt: now,
        updatedBy: userMock.username,
      });

      const result = await service.updateQuest(
        questId,
        updateData,
        userId,
        now,
      );
      expect(result).toEqual({
        ...questMock,
        ...updateData,
        updateAt: now,
        updatedBy: userMock.username,
      });
    });

    it('debería lanzar error si el cuestionario no existe', async () => {
      questsRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateQuest(
          'badQuestId',
          {} as UpdateQuestDto,
          'user1',
          new Date(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      questsRepository.findOne.mockResolvedValue({ id: 'quest1' } as Quest);
      usersRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateQuest(
          'quest1',
          {} as UpdateQuestDto,
          'badUser',
          new Date(),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('getQuestById', () => {
    it('debería retornar un cuestionario cuando existe con el ID proporcionado', async () => {
      const mockQuest = {
        id: 'quest123', // Esta propiedad no existe en el DTO real, pero la necesitas en la lógica de servicio.
        patientName: 'John Doe',
        patientDni: '12345678',
        pdfName: 'quest.pdf',
        jsonQuest: '{}',
        status: 'completed', // Asumo que la propiedad `status` es parte del DTO.
        createAt: new Date(),
        updateAt: new Date(),
        user: {
          id: 'user123',
          names: 'Doctor John',
          patSurname: 'Doe',
          matSurname: 'Smith',
        },
      };

      const mockQueryBuilder: any = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockQuest),
      };

      questsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getQuestById('quest123');

      // Validamos las llamadas a los métodos del query builder
      expect(questsRepository.createQueryBuilder).toHaveBeenCalledWith('quest');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'quest.user',
        'user',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('quest.id = :id', {
        id: 'quest123',
      });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();

      // Validamos que el resultado esté instanciado en el DTO
      expect(result).toBeInstanceOf(QuestResponseDto);
      expect(result.patientName).toBe('John Doe');
      expect(result.patientDni).toBe('12345678');
      expect(result.pdfName).toBe('quest.pdf');
      expect(result.jsonQuest).toBe('{}');
      expect(result.status).toBe('completed');
    });
    it('debería lanzar un error "Cuestionario no encontrado" si el cuestionario no existe', async () => {
      const mockQueryBuilder: any = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // Simulamos que no se encuentra el cuestionario
      };

      questsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Llamamos al servicio y esperamos que lance una excepción
      await expect(service.getQuestById('nonexistentQuestId')).rejects.toThrow(
        new BadRequestException('Cuestionario no encontrado'),
      );

      // Validamos que se haya llamado al método de query builder
      expect(questsRepository.createQueryBuilder).toHaveBeenCalledWith('quest');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'quest.user',
        'user',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('quest.id = :id', {
        id: 'nonexistentQuestId',
      });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });
  describe('getQuestsPaginated', () => {
    it('debería retornar los cuestionarios paginados correctamente con filtros', async () => {
      const mockQuests = [
        { id: 'q1', patientName: 'Juan Pérez' },
        { id: 'q2', patientName: 'Juana López' },
      ];

      const filters = {
        patientName: 'juan',
        patientDni: '12345678',
        doctorName: 'dr. smith',
        questType: 'type1',
      };

      const mockQueryBuilder: any = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockQuests, 8]),
      };

      questsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getQuestsPaginated(1, 2, filters);

      expect(result).toEqual({
        currentPage: 1,
        totalPages: 4,
        totalQuests: 8,
        quests: mockQuests,
      });

      expect(questsRepository.createQueryBuilder).toHaveBeenCalledWith('quest');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'quest.user',
        'user',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalled();

      // Verificamos que se hayan aplicado los filtros
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(quest.questType) = :questType',
        {
          questType: 'type1',
        },
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(quest.patientName) LIKE :patientName',
        {
          patientName: '%juan%',
        },
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(quest.patientDni) LIKE :patientDni',
        {
          patientDni: '%12345678%',
        },
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "LOWER(CONCAT(user.names, ' ', user.patSurname, ' ', user.matSurname)) LIKE :doctorName",
        {
          doctorName: '%dr. smith%',
        },
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'quest.createAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(2);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
  describe('updateQuestStatus', () => {
    it('debería actualizar exitosamente el estado del cuestionario', async () => {
      const questId = 'q1';
      const username = 'doctor01';
      const now = new Date();
      const currentQuest = {
        id: questId,
        status: 'an',
        updateAt: null,
        updatedBy: null,
      } as Quest;

      questsRepository.findOne.mockResolvedValueOnce(currentQuest);
      questsRepository.save.mockImplementation(async (quest: Quest) => ({
        ...quest,
        id: quest.id || 'some-unique-id', // Asegúrate de que `id` esté presente, ya que es requerido
        status: quest.status || 'ac', // Asegúrate de que `status` esté presente si es necesario
        updateAt: quest.updateAt || new Date(), // Asignar una fecha si es necesario
        updatedBy: quest.updatedBy || 'testUser', // Asigna un usuario si es necesario
      }));

      const result = await service.updateQuestStatus(
        questId,
        username,
        { status: 'ac' },
        now,
      );

      expect(result).toEqual({
        message: 'Cuestionario activado correctamente',
        questId,
        status: 'ac',
        updatedAt: now,
        updatedBy: username,
      });

      expect(questsRepository.findOne).toHaveBeenCalledWith({
        where: { id: questId },
      });
      expect(questsRepository.save).toHaveBeenCalledWith({
        ...currentQuest,
        status: 'ac',
        updateAt: now,
        updatedBy: username,
      });
    });

    it('debería lanzar error si el cuestionario no existe', async () => {
      questsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateQuestStatus(
          'badId',
          'doctor01',
          { status: 'ac' },
          new Date(),
        ),
      ).rejects.toThrow(new BadRequestException('Cuestionario no encontrado'));
    });

    it('debería lanzar error si el estado ya es el mismo', async () => {
      const questMock = {
        id: 'q2',
        status: 'ac',
        updateAt: null,
        updatedBy: null,
      } as Quest;

      questsRepository.findOne.mockResolvedValue(questMock);

      await expect(
        service.updateQuestStatus(
          'q2',
          'doctor01',
          { status: 'ac' },
          new Date(),
        ),
      ).rejects.toThrow(
        new BadRequestException('El cuestionario ya está en estado "ac"'),
      );
    });
  });
});
