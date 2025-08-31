import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from '../entities/boards.entity';
import { Repository } from 'typeorm';
import { BoardsService } from './boards.service';

describe('BoardsService', () => {
  let service: BoardsService;
  let repo: jest.Mocked<Repository<Board>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    repo = module.get(getRepositoryToken(Board));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a board with default statuses', async () => {
    repo.create.mockImplementation((dto) => dto as any);
    repo.save.mockResolvedValue({ id: 1, name: 'b', taskStatuses: ['todo', 'doing', 'done'] } as any);

    const result = await service.create({ name: 'b' });
    expect(result).toHaveProperty('id');
    expect(result.taskStatuses).toContain('todo');
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create a board with custom statuses', async () => {
    repo.create.mockImplementation((dto) => dto as any);
    repo.save.mockResolvedValue({ id: 2, name: 'b', taskStatuses: ['a', 'b'] } as any);

    const result = await service.create({ name: 'b', taskStatuses: ['a', 'b'] });
    expect(result.taskStatuses).toEqual(['a', 'b']);
  });

  it('should find all boards', async () => {
    repo.find.mockResolvedValue([{ id: 1, name: 'b' }] as any);
    const result = await service.findAll();
    expect(result.length).toBeGreaterThan(0);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should throw if board not found', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow('Board not found');
  });

  it('should update board name and statuses', async () => {
    repo.findOne.mockResolvedValue({ id: 1, name: 'old', taskStatuses: ['todo'] } as any);
    repo.save.mockResolvedValue({ id: 1, name: 'new', taskStatuses: ['a', 'b'] } as any);

    const result = await service.update(1, { name: 'new', taskStatuses: ['a', 'b'] });
    expect(result.name).toBe('new');
    expect(result.taskStatuses).toEqual(['a', 'b']);
  });

  it('should remove a board', async () => {
    repo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('should throw on remove if not found', async () => {
    repo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(99)).rejects.toThrow('Board not found');
  });
});