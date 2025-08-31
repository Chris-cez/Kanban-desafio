import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async addMember(dto: CreateBoardMemberDto): Promise<BoardMember> {
    const [user, board] = await Promise.all([
      this.userRepository.findOne({ where: { id: dto.userId } }),
      this.boardRepository.findOne({ where: { id: dto.boardId } }),
    ]);

    if (!user || !board) {
      throw new NotFoundException('User or Board not found');
    }

    const existingMember = await this.boardMemberRepository.findOne({
      where: { user: { id: user.id }, board: { id: board.id } },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this board');
    }

    const boardMember = this.boardMemberRepository.create({
      user,
      board,
      permissions: dto.permissions,
    });
    return this.boardMemberRepository.save(boardMember);
  }

  async getMembersByBoard(boardId: number): Promise<BoardMember[]> {
    return this.boardMemberRepository.find({
      where: { board: { id: boardId } },
      relations: ['user'],
    });
  }

  async updatePermissions(id: number, dto: UpdateBoardMemberDto): Promise<BoardMember> {
    const boardMember = await this.boardMemberRepository.findOne({ where: { id } });
    if (!boardMember) throw new NotFoundException('Board member not found');
    if (dto.permissions) boardMember.permissions = dto.permissions;
    return this.boardMemberRepository.save(boardMember);
  }

  async removeMember(id: number): Promise<void> {
    const result = await this.boardMemberRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Board member not found');
  }
}
