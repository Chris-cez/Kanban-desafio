import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Board } from '../entities/boards.entity';
import { Task } from '../entities/tasks.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>, // Mantido para futuras implementações como 'finalizer'
  ) {}

  async create(dto: CreateTaskDto, creator: User): Promise<Task> {
    const board = await this.boardRepository.findOneBy({ id: dto.boardId });
    if (!board) throw new NotFoundException(`Board with ID ${dto.boardId} not found`);

    if (dto.status && !board.taskStatuses.includes(dto.status)) {
      throw new BadRequestException('Invalid status for this board');
    }

    const task = this.taskRepository.create({
      ...dto,
      board,
      creator,
    });

    return this.taskRepository.save(task);
  }

  async findAll(boardId?: number): Promise<Task[]> {
    const where = boardId ? { board: { id: boardId } } : {};
    return this.taskRepository.find({
      where,
      relations: ['board', 'creator', 'finalizer'],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['board', 'creator', 'finalizer'],
    });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    // Usamos findOne para garantir que as relações (como 'board') sejam carregadas
    const task = await this.findOne(id); 

    if (dto.status) {
      // A relação 'task.board' já foi carregada pelo findOne
      if (!task.board.taskStatuses.includes(dto.status)) {
        throw new BadRequestException('Invalid status for this board');
      }
    }

    // Object.assign é uma forma limpa de mesclar as propriedades do DTO na entidade
    Object.assign(task, dto);

    return this.taskRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }
}
