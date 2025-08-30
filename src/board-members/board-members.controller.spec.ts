import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app/app.module';

describe('BoardMembersController (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: number;
  let boardId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Registre e faça login para obter um token JWT
    const userRes = await request(app.getHttpServer())
      .post('/users/register')
      .send({ login: 'memberuser', password: 'memberpass' });

    userId = userRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'memberuser', password: 'memberpass' });

    jwt = loginRes.body.access_token;

    // Crie um board
    const boardRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Board Members', taskStatuses: ['todo', 'doing', 'done'] });

    boardId = boardRes.body.id;
  });

  it('/board-members (POST) - deve adicionar membro', async () => {
    const res = await request(app.getHttpServer())
      .post('/board-members')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ userId, boardId, permissions: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('/board-members (GET) - deve listar membros do board', async () => {
    const res = await request(app.getHttpServer())
      .get(`/board-members?boardId=${boardId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/board-members/:id (PATCH) - deve atualizar permissões', async () => {
    // Adicione um membro para atualizar
    const addRes = await request(app.getHttpServer())
      .post('/board-members')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ userId, boardId, permissions: 'read' });

    const memberId = addRes.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/board-members/${memberId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ permissions: 'write' });

    expect(res.status).toBe(200);
    expect(res.body.permissions).toBe('write');
  });

  it('/board-members/:id (DELETE) - deve remover membro', async () => {
    // Adicione um membro para remover
    const addRes = await request(app.getHttpServer())
      .post('/board-members')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ userId, boardId, permissions: 'read' });

    const memberId = addRes.body.id;

    const res = await request(app.getHttpServer())
      .delete(`/board-members/${memberId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
