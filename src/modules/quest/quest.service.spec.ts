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

  // beforeEach() se ejecuta antes de cada prueba, Se usa para inicializar valores, instancias de servicios o configurar mocks antes de ejecutar cada test individual.
  // mock: version simulada de un objeto
  beforeEach(async () => {
    // configuracion de entorno de prueba
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestService,
        {
          // Se usa getRepositoryToken() para obtener los repositorios en memoria y simular sus métodos con Jest (jest.fn()).
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Quest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
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
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    questsRepository = module.get<Repository<Quest>>(getRepositoryToken(Quest));
    catalogsRepository = module.get<Repository<Catalog>>(
      getRepositoryToken(Catalog),
    );
  });

  it('debería crear un cuestionario exitosamente', async () => {
    const userId = '15b957f4-1fc2-48cb-a280-f53e2672038d'; // usuario valido
    const now = new Date();
    const createQuestDto: CreateQuestDto = {
      questType: '3',
      patientName: 'Juan Alberto Dominguez Alvarado',
      patientDni: '05236589',
      pdfName: '12.01.2025-CASEG-JDOMINGUEZA',
      jsonQuest:
        '{codigo:001, nombre:abcd, questions:[{id:1,question:tienes covid?}]}',
    };

    const mockUser = { id: userId, username: 'testUser' };
    const mockQuestType = { id: '1', name: 'Test Type' };
    const mockNewQuest = {
      ...createQuestDto,
      createdBy: mockUser.username,
      createAt: now,
    };

    usersRepository.findOne = jest.fn().mockResolvedValue(mockUser); // devuelve un usuario
    catalogsRepository.findOne = jest.fn().mockResolvedValue(mockQuestType); // devuelve un tipo de cuestionario
    questsRepository.create = jest.fn().mockReturnValue(mockNewQuest); // devuelve un objeto de cuestionario nuevo
    questsRepository.save = jest.fn().mockResolvedValue(mockNewQuest); // guarda una cuestionario
    // se ejecuta service.createQuest()
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

  it('debería lanzar un error si el usuario no existe', async () => {
    usersRepository.findOne = jest.fn().mockResolvedValue(null);
    const createQuestDto: CreateQuestDto = {
      questType: '3',
      patientName: 'Juan Alberto Dominguez Alvarado',
      patientDni: '05236589',
      pdfName: '12.01.2025-CASEG-JDOMINGUEZA',
      jsonQuest:
        '{codigo:001, nombre:abcd, questions:[{id:1,question:tienes covid?}]}',
    };

    await expect(
      service.createQuest(createQuestDto, 'invalidUserId', new Date()),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería lanzar un error si el tipo de cuestionario no existe', async () => {
    // simula que el usuario existe en la base de datos
    usersRepository.findOne = jest
      .fn()
      .mockResolvedValue({ id: '123', username: 'testUser' }); // crea el mock con esos valores

    // simula que el catalogo no existe en la base de datos, devuele null
    catalogsRepository.findOne = jest.fn().mockResolvedValue(null);

    const createQuestDto: CreateQuestDto = {
      questType: '3',
      patientName: 'Juan Alberto Dominguez Alvarado',
      patientDni: '05236589',
      pdfName: '12.01.2025-CASEG-JDOMINGUEZA',
      jsonQuest:
        '{codigo:001, nombre:abcd, questions:[{id:1,question:tienes covid?}]}',
    };

    await expect(
      service.createQuest(createQuestDto, '123', new Date()),
    ).rejects.toThrow(BadRequestException);
  });
});
