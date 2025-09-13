import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';
import { BoardMemberPermission } from '../dto/create-board-member.dto';

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
    const user = await this.userRepository.findOneBy({ login: dto.userLogin });
    if (!user) throw new NotFoundException(`Usuário com login '${dto.userLogin}' não encontrado.`);

    const board = await this.boardRepository.findOneBy({ id: dto.boardId });
    if (!board) throw new NotFoundException(`Quadro com ID ${dto.boardId} não encontrado.`);

    const existingMember = await this.boardMemberRepository.findOne({
      where: { user: { id: user.id }, board: { id: dto.boardId } },
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

  async updatePermissions(memberId: number, dto: UpdateBoardMemberDto, requestingUser: User): Promise<BoardMember> {
    const boardMember = await this.boardMemberRepository.findOne({ where: { id: memberId }, relations: ['board'] });
    if (!boardMember) throw new NotFoundException(`Board member with ID ${memberId} not found`);

    // Verifica se o usuário que está fazendo a requisição é admin do quadro
    const requesterMembership = await this.boardMemberRepository.findOneBy({
      user: { id: requestingUser.id },
      board: { id: boardMember.board.id },
    });

    if (requesterMembership?.permissions !== BoardMemberPermission.ADMIN) {
      throw new ForbiddenException('Only board admins can change permissions.');
    }

    if (dto.permissions) boardMember.permissions = dto.permissions;
    return this.boardMemberRepository.save(boardMember);
  }

  async removeMember(memberId: number, requestingUser: User): Promise<void> {
    const memberToRemove = await this.boardMemberRepository.findOne({
      where: { id: memberId },
      relations: ['user', 'board'],
    });
    if (!memberToRemove) throw new NotFoundException(`Board member with ID ${memberId} not found`);

    const requesterMembership = await this.boardMemberRepository.findOneBy({
      user: { id: requestingUser.id },
      board: { id: memberToRemove.board.id },
    });

    const isAdmin = requesterMembership?.permissions === BoardMemberPermission.ADMIN;
    if (!isAdmin) {
      throw new ForbiddenException('Only board admins can remove members.');
    }

    // Impede que o último admin seja removido
    if (memberToRemove.permissions === BoardMemberPermission.ADMIN) {
      const adminCount = await this.boardMemberRepository.countBy({
        board: { id: memberToRemove.board.id },
        permissions: BoardMemberPermission.ADMIN,
      });
      if (adminCount <= 1) throw new ForbiddenException('Cannot remove the last admin from the board.');
    }

    await this.boardMemberRepository.remove(memberToRemove);
  }
}
