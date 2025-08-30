import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from 'src/entities/boards.entity';
import { Task } from 'src/entities/tasks.entity';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let boardRepo: jest.Mocked<Repository<Board>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(Board), useValue: { findOne: jest.fn() } },
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
    boardRepo.findOne.mockResolvedValue(null);
    await expect(service.create({ name: 't', status: 'todo', boardId: 1, creatorId: 1 })).rejects.toThrow('Board not found');
  });

  it('should throw if status is invalid', async () => {
    boardRepo.findOne.mockResolvedValue({ id: 1, taskStatuses: ['todo'] } as any);
    userRepo.findOne.mockResolvedValue({ id: 1 } as any);
    await expect(service.create({ name: 't', status: 'invalid', boardId: 1, creatorId: 1 })).rejects.toThrow('Invalid status for this board');
  });

  it('should throw if creator not found', async () => {
    boardRepo.findOne.mockResolvedValue({ id: 1, taskStatuses: ['todo'] } as any);
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.create({ name: 't', status: 'todo', boardId: 1, creatorId: 1 })).rejects.toThrow('Creator not found');
  });

  it('should create and save a task', async () => {
    boardRepo.findOne.mockResolvedValue({ id: 1, taskStatuses: ['todo'] } as any);
    userRepo.findOne.mockResolvedValue({ id: 1 } as any);
    taskRepo.create.mockImplementation((dto) => ({ ...dto } as Task));
    taskRepo.save.mockResolvedValue({ id: 1, name: 't' } as any);

    const result = await service.create({ name: 't', status: 'todo', boardId: 1, creatorId: 1 });
    expect(result).toHaveProperty('id');
    expect(taskRepo.create).toHaveBeenCalled();
    expect(taskRepo.save).toHaveBeenCalled();
  });

  // Adicione testes para update, findAll, findOne, remove, etc.
});