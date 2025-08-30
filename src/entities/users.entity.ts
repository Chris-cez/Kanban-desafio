import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './tasks.entity';
import { BoardMember } from './board-members.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @OneToMany(() => Task, task => task.creator)
  createdTasks: Task[];

  @OneToMany(() => Task, task => task.finalizer)
  completedTasks: Task[];

  @OneToMany(() => BoardMember, boardMember => boardMember.user)
  boardMembers: BoardMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}