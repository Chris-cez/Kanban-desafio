import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardMemberPermission, CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { BoardMembersService } from './board-members.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';
describe('BoardMembersService', () => {
  let service: BoardMembersService;
  let boardMemberRepo: jest.Mocked<Repository<BoardMember>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let boardRepo: jest.Mocked<Repository<Board>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardMembersService,
        { provide: getRepositoryToken(BoardMember), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), remove: jest.fn(), findOneBy: jest.fn(), countBy: jest.fn() } },
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

  describe('addMember', () => {
    const dto: CreateBoardMemberDto = { userLogin: 'testuser', boardId: 1, permissions: BoardMemberPermission.ADMIN };

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.addMember(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if board not found', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      boardRepo.findOne.mockResolvedValue(null);
      await expect(service.addMember(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is already a member', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      boardRepo.findOne.mockResolvedValue({ id: 1 } as Board);
      boardMemberRepo.findOne.mockResolvedValue({ id: 1 } as BoardMember);
      await expect(service.addMember(dto)).rejects.toThrow(ConflictException);
    });

    it('should add a member successfully', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      boardRepo.findOne.mockResolvedValue({ id: 1 } as Board);
      boardMemberRepo.findOne.mockResolvedValue(null);
      boardMemberRepo.create.mockImplementation((d) => d as any);
      boardMemberRepo.save.mockResolvedValue({ id: 1, ...dto } as any);

      const result = await service.addMember(dto);
      expect(result).toHaveProperty('id');
      expect(boardMemberRepo.create).toHaveBeenCalled();
      expect(boardMemberRepo.save).toHaveBeenCalled();
    });
  });

  it('should get members by board', async () => {
    boardMemberRepo.find.mockResolvedValue([{ id: 1 }] as any);
    const result = await service.getMembersByBoard(1);
    expect(Array.isArray(result)).toBe(true);
    expect(boardMemberRepo.find).toHaveBeenCalledWith({ where: { board: { id: 1 } }, relations: ['user'] });
  });

  describe('updatePermissions', () => {
    const dto: UpdateBoardMemberDto = { permissions: BoardMemberPermission.ADMIN };
    const requestingUser = { id: 1 } as User;
    const boardMember = { id: 2, permissions: BoardMemberPermission.READ, board: { id: 1 } } as BoardMember;

    it('should throw if board member not found', async () => {
      boardMemberRepo.findOne.mockResolvedValue(null);
      await expect(service.updatePermissions(99, dto, requestingUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw if requester is not an admin', async () => {
      boardMemberRepo.findOne.mockResolvedValue(boardMember);
      boardMemberRepo.findOneBy.mockResolvedValue({ permissions: BoardMemberPermission.WRITE } as BoardMember);
      await expect(service.updatePermissions(2, dto, requestingUser)).rejects.toThrow(ForbiddenException);
    });

    it('should update permissions successfully', async () => {
      boardMemberRepo.findOne.mockResolvedValue(boardMember);
      boardMemberRepo.findOneBy.mockResolvedValue({ permissions: BoardMemberPermission.ADMIN } as BoardMember);
      boardMemberRepo.save.mockResolvedValue({ ...boardMember, ...dto } as any);

      const result = await service.updatePermissions(2, dto, requestingUser);
      expect(result.permissions).toBe(BoardMemberPermission.ADMIN);
    });
  });

  describe('removeMember', () => {
    const requestingUser = { id: 1 } as User;
    const memberToRemove = { id: 2, user: { id: 2 }, board: { id: 1 }, permissions: BoardMemberPermission.READ } as BoardMember;

    it('should throw if member not found', async () => {
      boardMemberRepo.findOne.mockResolvedValue(null);
      await expect(service.removeMember(99, requestingUser)).rejects.toThrow(NotFoundException);
    });

    it('should remove a member successfully', async () => {
      boardMemberRepo.findOne.mockResolvedValue(memberToRemove);
      boardMemberRepo.findOneBy.mockResolvedValue({ permissions: BoardMemberPermission.ADMIN } as BoardMember);

      await service.removeMember(2, requestingUser);
      expect(boardMemberRepo.remove).toHaveBeenCalledWith(memberToRemove);
    });
  });
});