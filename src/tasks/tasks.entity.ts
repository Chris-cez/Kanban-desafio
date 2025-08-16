import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Board } from 'src/boards/boards.entity';
import { User } from 'src/users/users.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: string;

  @Column({ default: false })
  archived: boolean;

  @ManyToOne(() => Board, board => board.tasks)
  board: Board;

  @ManyToOne(() => User, user => user.createdTasks)
  creator: User;

  @ManyToOne(() => User, user => user.completedTasks)
  finalizer: User;
}