import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app/app.module';

describe('BoardsController (e2e)', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const login = `boarduser-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/users/register')
      .send({ login, password: 'boardpassword' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login, password: 'boardpassword' });

    jwt = res.body.access_token;
  });

  it('/boards (POST) - deve criar um board', async () => {
    const res = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Meu Board', taskStatuses: ['todo', 'doing', 'done'] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Meu Board');
  });

  it('/boards (GET) - deve listar boards', async () => {
    const res = await request(app.getHttpServer())
      .get('/boards')
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/boards/:id (GET) - deve retornar um board', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Outro Board' });

    const id = createRes.body.id;

    const res = await request(app.getHttpServer())
      .get(`/boards/${id}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
  });

  it('/boards/:id (PATCH) - deve atualizar um board', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Atualizar Board' });

    const id = createRes.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/boards/${id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Atualizado', taskStatuses: ['doing', 'done'] });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Atualizado');
    expect(res.body.taskStatuses).toEqual(['doing', 'done']);
  });

  it('/boards/:id (DELETE) - deve remover um board', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Remover Board' });

    const id = createRes.body.id;

    const res = await request(app.getHttpServer())
      .delete(`/boards/${id}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
