import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { User } from '../entities/users.entity';
import { BoardsService } from './boards.service';

describe('BoardsService', () => {
  let service: BoardsService;
  let boardRepo: jest.Mocked<Repository<Board>>;
  let boardMemberRepo: jest.Mocked<Repository<BoardMember>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: jest.fn(() => ({
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          }))(),
        },
        {
          provide: getRepositoryToken(BoardMember),
          useValue: jest.fn(() => ({
            create: jest.fn(),
            save: jest.fn(),
          }))(),
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    boardRepo = module.get(getRepositoryToken(Board));
    boardMemberRepo = module.get(getRepositoryToken(BoardMember));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a board and make the creator an admin', async () => {
    const mockUser = { id: 1, login: 'test' } as User;
    const createDto = { name: 'Test Board' };
    const savedBoard = { id: 1, ...createDto, taskStatuses: ['todo', 'doing', 'done'] } as Board;

    boardRepo.create.mockReturnValue(createDto as any);
    boardRepo.save.mockResolvedValue(savedBoard);
    boardMemberRepo.create.mockImplementation((dto) => dto as any);
    boardMemberRepo.save.mockResolvedValue({} as any);

    const result = await service.create(createDto, mockUser);

    expect(result).toHaveProperty('id');
    expect(boardRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Board' }));
    expect(boardRepo.save).toHaveBeenCalled();
    expect(boardMemberRepo.create).toHaveBeenCalledWith({
      board: savedBoard,
      user: mockUser,
      permissions: BoardMemberPermission.ADMIN,
    });
    expect(boardMemberRepo.save).toHaveBeenCalled();
  });

  it('should find all boards for a user', async () => {
    const mockBoards = [{ id: 1, name: 'User Board' }] as Board[];
    const mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockBoards),
    };
    boardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    const result = await service.findAllForUser(1);
    expect(result).toEqual(mockBoards);
    expect(boardRepo.createQueryBuilder).toHaveBeenCalledWith('board');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('member.userId = :userId', { userId: 1 });
  });

  it('should throw if board not found', async () => {
    boardRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99, 1)).rejects.toThrow('Board not found');
  });

  it('should update board name and statuses', async () => {
    boardRepo.findOneBy.mockResolvedValue({ id: 1, name: 'old', taskStatuses: ['todo'] } as any);
    boardRepo.save.mockResolvedValue({ id: 1, name: 'new', taskStatuses: ['a', 'b'] } as any);

    const result = await service.update(1, { name: 'new', taskStatuses: ['a', 'b'] });
    expect(result.name).toBe('new');
    expect(result.taskStatuses).toEqual(['a', 'b']);
  });

  it('should remove a board', async () => {
    boardRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('should throw on remove if not found', async () => {
    boardRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(99)).rejects.toThrow('Board not found');
  });
});