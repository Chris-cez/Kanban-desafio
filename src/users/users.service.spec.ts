import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user if login does not exist', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((dto) => dto as any);
    repo.save.mockImplementation(async (user) => ({
      id: 1,
      login: user.login as string,
      password: user.password as string,
      createdTasks: [],
      completedTasks: [],
      boardMembers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User));

    const user = await service.create('newuser', 'password123');
    expect(user).toHaveProperty('id');
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if login already exists', async () => {
    repo.findOne.mockResolvedValue({ id: 1, login: 'existing', password: 'hash' } as User);

    await expect(service.create('existing', 'password123')).rejects.toThrow('User with this login already exists');
  });

  it('should hash the password', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((dto) => dto as any);
    repo.save.mockImplementation(async (user) => ({
      id: 1,
      login: (user.login ?? '') as string,
      password: (user.password ?? '') as string,
      createdTasks: [],
      completedTasks: [],
      boardMembers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User));

    const user = await service.create('hashuser', 'plainpass');
    expect(user.password).not.toBe('plainpass');
    expect(await bcrypt.compare('plainpass', user.password)).toBe(true);
  });

  it('should find user by login', async () => {
    const fakeUser = { id: 2, login: 'findme', password: 'hash' } as User;
    repo.findOne.mockResolvedValue(fakeUser);

    const user = await service.findByLogin('findme');
    expect(user).toEqual(fakeUser);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { login: 'findme' } });
  });

  it('should return all users', async () => {
    const users = [{ id: 1, login: 'a', password: 'x' }, { id: 2, login: 'b', password: 'y' }] as User[];
    repo.find.mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(repo.find).toHaveBeenCalled();
  });
});