import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from '../entities/boards.entity';
import { Task } from '../entities/tasks.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let boardRepo: jest.Mocked<Repository<Board>>;
  let userRepo: jest.Mocked<Repository<User>>;
  const mockUser = { id: 1, login: 'test-user' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(Board), useValue: { findOne: jest.fn(), findOneBy: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get(getRepositoryToken(Task));
    boardRepo = module.get(getRepositoryToken(Board));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if board not found on create', async () => {
    boardRepo.findOneBy.mockResolvedValue(null);
    await expect(service.create({ name: 't', status: 'todo', boardId: 1 }, mockUser)).rejects.toThrow('Board with ID 1 not found');
  });

  it('should throw if status is invalid', async () => {
    boardRepo.findOneBy.mockResolvedValue({ id: 1, taskStatuses: ['todo'] } as any);
    await expect(service.create({ name: 't', status: 'invalid', boardId: 1 }, mockUser)).rejects.toThrow('Invalid status for this board');
  });

  it('should create and save a task', async () => {
    boardRepo.findOneBy.mockResolvedValue({ id: 1, taskStatuses: ['todo'] } as any);
    taskRepo.create.mockImplementation((dto) => ({ ...dto } as Task));
    taskRepo.save.mockResolvedValue({ id: 1, name: 't' } as any);

    const result = await service.create({ name: 't', status: 'todo', boardId: 1 }, mockUser);
    expect(result).toHaveProperty('id');
    expect(taskRepo.create).toHaveBeenCalledWith({ name: 't', status: 'todo', boardId: 1, board: expect.anything(), creator: mockUser });
    expect(taskRepo.save).toHaveBeenCalled();
  });

  // Adicione testes para update, findAll, findOne, remove, etc.
});