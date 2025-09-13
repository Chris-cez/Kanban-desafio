import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../entities/boards.entity';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { BoardMemberPermission } from '../dto/create-board-member.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
  ) {}

  async create(dto: CreateBoardDto, user: User): Promise<Board> {
    const board = this.boardRepository.create({
      name: dto.name,
      taskStatuses: dto.taskStatuses && dto.taskStatuses.length > 0 ? dto.taskStatuses : ['todo', 'doing', 'done'],
    });
    const savedBoard = await this.boardRepository.save(board);

    // Adiciona o criador como admin do quadro
    const adminMembership = this.boardMemberRepository.create({
      board: savedBoard,
      user: user,
      permissions: BoardMemberPermission.ADMIN,
    });
    await this.boardMemberRepository.save(adminMembership);

    return savedBoard;
  }

  async findAllForUser(userId: number): Promise<Board[]> {
    return this.boardRepository
      .createQueryBuilder('board')
      .leftJoin('board.boardMembers', 'member')
      .where('member.userId = :userId', { userId })
      .getMany();
  }

  async findOne(id: number, userId: number): Promise<Board & { currentUserPermission?: BoardMemberPermission }> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['tasks', 'boardMembers'],
    });
    if (!board) throw new NotFoundException('Board not found');

    const membership = await this.boardMemberRepository.findOneBy({
      board: { id: id },
      user: { id: userId },
    });

    return {
      ...board,
      currentUserPermission: membership?.permissions,
    };
  }

  async update(id: number, dto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) throw new NotFoundException(`Board with ID ${id} not found`);
    if (dto.name !== undefined) board.name = dto.name;
    if (dto.taskStatuses !== undefined && dto.taskStatuses.length > 0) {
      board.taskStatuses = dto.taskStatuses;
    }
    return this.boardRepository.save(board);
  }

  async remove(id: number): Promise<void> {
    const result = await this.boardRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Board not found');
  }
}
