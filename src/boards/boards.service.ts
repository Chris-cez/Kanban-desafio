import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/entities/boards.entity';
import { Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(dto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create({
      name: dto.name,
      taskStatuses: dto.taskStatuses && dto.taskStatuses.length > 0 ? dto.taskStatuses : ['todo', 'doing', 'done'],
    });
    return this.boardRepository.save(board);
  }

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find({ relations: ['tasks', 'boardMembers'] });
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['tasks', 'boardMembers'],
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(id: number, dto: UpdateBoardDto): Promise<Board> {
    const board = await this.findOne(id);
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
