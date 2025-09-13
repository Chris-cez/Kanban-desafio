import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app/app.module';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const login = `taskuser-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/users/register')
      .send({ login, password: 'taskpassword' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login, password: 'taskpassword' });

    jwt = res.body.access_token;
  });

  it('/tasks (POST) - deve criar uma tarefa', async () => {
    const boardRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Board Test', taskStatuses: ['todo', 'doing', 'done'] });

    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        name: 'Minha tarefa',
        status: 'todo',
        boardId: boardRes.body.id,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });


  afterAll(async () => {
    await app.close();
  });
});
