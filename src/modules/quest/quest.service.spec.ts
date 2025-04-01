import { Test, TestingModule } from '@nestjs/testing';
import { QuestService } from './quest.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { User } from '../users/users.entity';
import { Quest } from './quest.entity';
import { Catalog } from '../catalog/catalog.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';

describe('QuestService', () => {
  let service: QuestService;
  let usersRepository: Repository<User>;
  let questsRepository: Repository<Quest>;
  let catalogsRepository: Repository<Catalog>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Quest),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Catalog),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<QuestService>(QuestService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    questsRepository = module.get<Repository<Quest>>(getRepositoryToken(Quest));
    catalogsRepository = module.get<Repository<Catalog>>(
      getRepositoryToken(Catalog),
    );
  });

  describe('createQuest', () => {
    const userId = '15b957f4-1fc2-48cb-a280-f53e2672038d';
    const now = new Date();
    const createQuestDto: CreateQuestDto = {
      questType: '3',
      patientName: 'Juan Alberto Dominguez Alvarado',
      patientDni: '05236589',
      pdfName: '12.01.2025-CASEG-JDOMINGUEZA',
      jsonQuest:
        '{codigo:001, nombre:abcd, questions:[{id:1,question:tienes covid?}]}',
    };

    describe('cuando la creación es exitosa', () => {
      it('debería crear un cuestionario exitosamente', async () => {
        const mockUser: User = {
          id: userId,
          codProfile: '1',
          documentType: '1',
          documentNum: '52052020',
          cmp: '250520',
          names: 'PEDROe',
          patSurname: 'CABRERAe',
          matSurname: 'QUISPEe',
          username: 'PEDRO05e',
          email: 'pedro@gmail.com',
          password:
            '$2b$10$WvYtUPY8V9Nc4eSwjkUSNuk/ycN22JnI85VtRX5EcluBgAQT9Cuvu',
          cellphone: '934602459',
          routeStamp:
            'D:\\doctor\\firmas\\15B957F4-1FC2-48CB-A280-F53E2672038D\\firma.png',
          status: 'ac',
          lastLogin: new Date(),
          lastFailedLogin: null,
          availableLoginNumber: 5,
          failedLoginAttempts: 0,
          createAt: new Date(),
          createdBy: 'SADMINS',
          updateAt: new Date(),
          updatedBy: 'SADMINS',
          userExpirationDate: new Date(),
          userExpirationFlag: 1,
          passwordExpirationDate: new Date(),
          passwordExpirationFlag: 1,
          isMfaEnabled: true,
          isNewUser: true,
          mfaSecrect: 'HMQQGVRUDYSHWXJW',
          quests: [],
        };
        const mockQuestType: Catalog = {
          id: '1',
          name: 'Test Type',
          codeName: 'CODE_123',
          detail: 'Detail of test type',
        };
        const mockNewQuest: Quest = {
          id: '123',
          createdBy: mockUser.username,
          createAt: now,
          updateAt: now,
          updatedBy: mockUser.username,
          questType: createQuestDto.questType,
          patientName: createQuestDto.patientName,
          patientDni: createQuestDto.patientDni,
          pdfName: createQuestDto.pdfName,
          jsonQuest: createQuestDto.jsonQuest,
          user: mockUser, // Relación con el usuario
        };

        jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
        jest
          .spyOn(catalogsRepository, 'findOne')
          .mockResolvedValue(mockQuestType);
        jest.spyOn(questsRepository, 'create').mockReturnValue(mockNewQuest);
        jest.spyOn(questsRepository, 'save').mockResolvedValue(mockNewQuest);

        const result = await service.createQuest(createQuestDto, userId, now);

        expect(usersRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
        });
        expect(catalogsRepository.findOne).toHaveBeenCalledWith({
          where: { id: createQuestDto.questType },
        });
        expect(questsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ createdBy: 'testUser' }),
        );
        expect(questsRepository.save).toHaveBeenCalledWith(mockNewQuest);
        expect(result).toEqual(mockNewQuest);
      });
    });

    describe('cuando hay errores', () => {
      it('debería lanzar un error si el usuario no existe', async () => {
        jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

        await expect(
          service.createQuest(createQuestDto, 'invalidUserId', new Date()),
        ).rejects.toThrow(BadRequestException);
      });

      it('debería lanzar un error si el tipo de cuestionario no existe', async () => {
        jest.spyOn(usersRepository, 'findOne').mockResolvedValue({
          id: '123',
          username: 'testUser',
        } as User);
        jest.spyOn(catalogsRepository, 'findOne').mockResolvedValue(null);

        await expect(
          service.createQuest(createQuestDto, '123', new Date()),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  // Aquí se pueden agregar más describe para otros métodos de QuestService
});
