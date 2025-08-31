import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('/users/register (POST) - deve registrar usuário', async () => {
    const login = `testuser-${Date.now()}`;
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ login, password: 'testpassword' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('/users/register (POST) - não deve registrar usuário duplicado', async () => {
    const login = `duplicado-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/users/register')
      .send({ login, password: 'password' });

    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ login, password: 'password' });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('User with this login already exists');
  });

  it('/users/register (POST) - deve validar campos obrigatórios', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ login: '', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
