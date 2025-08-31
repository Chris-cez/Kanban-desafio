import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { BoardMembersService } from './board-members.service';

describe('BoardMembersService', () => {
  let service: BoardMembersService;
  let boardMemberRepo: jest.Mocked<Repository<BoardMember>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let boardRepo: jest.Mocked<Repository<Board>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardMembersService,
        { provide: getRepositoryToken(BoardMember), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Board), useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<BoardMembersService>(BoardMembersService);
    boardMemberRepo = module.get(getRepositoryToken(BoardMember));
    userRepo = module.get(getRepositoryToken(User));
    boardRepo = module.get(getRepositoryToken(Board));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if user or board not found on addMember', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.addMember({ userId: 1, boardId: 1, permissions: BoardMemberPermission.ADMIN })).rejects.toThrow('User or Board not found');

    userRepo.findOne.mockResolvedValue({} as User);
    boardRepo.findOne.mockResolvedValue(null);
    await expect(service.addMember({ userId: 1, boardId: 1, permissions: BoardMemberPermission.ADMIN })).rejects.toThrow('User or Board not found');
    await expect(service.addMember({ userId: 1, boardId: 1, permissions: BoardMemberPermission.ADMIN })).rejects.toThrow('User or Board not found');
  });

  it('should add a member', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1 } as User);
    boardRepo.findOne.mockResolvedValue({ id: 1 } as Board);
    boardMemberRepo.create.mockImplementation((dto) => dto as any);
    boardMemberRepo.save.mockResolvedValue({ id: 1, permissions: BoardMemberPermission.ADMIN } as any);

    const result = await service.addMember({ userId: 1, boardId: 1, permissions: BoardMemberPermission.ADMIN });
    expect(result).toHaveProperty('id');
    expect(boardMemberRepo.create).toHaveBeenCalled();
    expect(boardMemberRepo.save).toHaveBeenCalled();
    expect(boardMemberRepo.save).toHaveBeenCalled();
  });

  it('should get members by board', async () => {
    boardMemberRepo.find.mockResolvedValue([{ id: 1 }] as any);
    const result = await service.getMembersByBoard(1);
    expect(Array.isArray(result)).toBe(true);
    expect(boardMemberRepo.find).toHaveBeenCalledWith({ where: { board: { id: 1 } }, relations: ['user'] });
  });

  it('should update permissions of a board member', async () => {
    boardMemberRepo.findOne.mockResolvedValue({ id: 1, permissions: BoardMemberPermission.READ } as any);
    boardMemberRepo.save.mockResolvedValue({ id: 1, permissions: BoardMemberPermission.ADMIN } as any);

    const result = await service.updatePermissions(1, { permissions: BoardMemberPermission.ADMIN });
    expect(result.permissions).toBe(BoardMemberPermission.ADMIN);
    expect(result.permissions).toBe('admin');
  });

  it('should throw if board member not found on updatePermissions', async () => {
    boardMemberRepo.findOne.mockResolvedValue(null);
    await expect(service.updatePermissions(99, { permissions: BoardMemberPermission.ADMIN })).rejects.toThrow('Board member not found');
  });

  it('should remove a member', async () => {
    boardMemberRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.removeMember(1)).resolves.toBeUndefined();
  });

  it('should throw if member not found on remove', async () => {
    boardMemberRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.removeMember(99)).rejects.toThrow('Board member not found');
  });
});