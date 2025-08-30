import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(login: string, password: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { login } });
    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({ login, password: passwordHash });
    return this.usersRepository.save(newUser);
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { login } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}