import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../entities/boards.entity';
import { Task } from '../entities/tasks.entity';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto, creator: User): Promise<Task> {
    const board = await this.boardRepository.findOne({ where: { id: createTaskDto.boardId } });
    if (!board) throw new NotFoundException('Board not found');

    if (
      createTaskDto.status &&
      !board.taskStatuses.includes(createTaskDto.status)
    ) {
      throw new BadRequestException('Invalid status for this board');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
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
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.status) {
      const board = await this.boardRepository.findOne({ where: { id: task.board.id } });
      if (!board || !board.taskStatuses.includes(updateTaskDto.status)) {
        throw new BadRequestException('Invalid status for this board');
      }
      task.status = updateTaskDto.status;
    }

    if (updateTaskDto.name !== undefined) task.name = updateTaskDto.name;
    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.archived !== undefined) task.archived = updateTaskDto.archived;

    if (updateTaskDto.finalizerId !== undefined) {
      if (updateTaskDto.finalizerId === null) {
        task.finalizer = null;
      } else {
        const finalizer = await this.userRepository.findOne({ where: { id: updateTaskDto.finalizerId } });
        if (!finalizer) throw new NotFoundException('Finalizer not found');
        task.finalizer = finalizer;
      }
    }

    return this.taskRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }
}
