import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Board } from './boards.entity';
import { User } from './users.entity';

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

  @ManyToOne(() => Board, board => board.tasks, { onDelete: 'CASCADE' })
  board: Board;

  @ManyToOne(() => User, user => user.createdTasks)
  creator: User;

  @ManyToOne(() => User, user => user.completedTasks, { nullable: true })
  finalizer: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}