import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app/app.module';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';

describe('BoardsController (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let boardId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const login = `board-test-user-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/users/register')
      .send({ login, password: 'password' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login, password: 'password' });

    jwt = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/boards (POST)', () => {
    it('should create a board successfully', async () => {
      const createBoardDto: CreateBoardDto = { name: 'My Test Board' };
      const res = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${jwt}`)
        .send(createBoardDto)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(createBoardDto.name);
      expect(res.body.taskStatuses).toEqual(['todo', 'doing', 'done']);
      boardId = res.body.id; // Save for later tests
    });

    it('should fail if name is missing', () => {
      return request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${jwt}`)
        .send({})
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/boards')
        .send({ name: 'No Auth Board' })
        .expect(401);
    });
  });

  describe('/boards (GET)', () => {
    it('should return all boards for the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/boards')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/boards').expect(401);
    });
  });

  describe('/boards/:id (GET, PATCH, DELETE)', () => {
    it('GET /boards/:id - should return the correct board', async () => {
      const res = await request(app.getHttpServer())
        .get(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200);

      expect(res.body.id).toBe(boardId);
      expect(res.body.name).toBe('My Test Board');
      expect(res.body).toHaveProperty('currentUserPermission', 'admin');
    });

    it('GET /boards/:id - should fail for a non-existent board', () => {
      return request(app.getHttpServer())
        .get('/boards/99999')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(404);
    });

    it('PATCH /boards/:id - should update the board successfully', async () => {
      const updateDto: UpdateBoardDto = { name: 'Updated Board Name' };
      const res = await request(app.getHttpServer())
        .patch(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.name).toBe(updateDto.name);
    });

    it('PATCH /boards/:id - should fail if user is not an admin', async () => {
      // Create a new user and token
      const otherUserLogin = `other-user-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/users/register')
        .send({ login: otherUserLogin, password: 'password' });
      const otherLoginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: otherUserLogin, password: 'password' });
      const otherJwt = otherLoginRes.body.access_token;

      // Add the new user to the board with 'write' permissions
      await request(app.getHttpServer())
        .post('/board-members')
        .set('Authorization', `Bearer ${jwt}`) // Admin adds member
        .send({ boardId, userLogin: otherUserLogin, permissions: 'write' });

      // Try to update with 'write' permission (should fail as controller requires ADMIN for PATCH)
      // Correction: The controller allows WRITE. Let's test a forbidden case.
      // The controller has `@Permissions(BoardMemberPermission.ADMIN, BoardMemberPermission.WRITE)`
      // Let's re-add with READ and test that.

      // Let's create a read-only user
      const readOnlyLogin = `readonly-user-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/users/register')
        .send({ login: readOnlyLogin, password: 'password' });
      const readOnlyLoginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: readOnlyLogin, password: 'password' });
      const readOnlyJwt = readOnlyLoginRes.body.access_token;

      await request(app.getHttpServer())
        .post('/board-members')
        .set('Authorization', `Bearer ${jwt}`)
        .send({ boardId, userLogin: readOnlyLogin, permissions: 'read' });

      await request(app.getHttpServer())
        .patch(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${readOnlyJwt}`)
        .send({ name: 'Attempted Update' })
        .expect(403);
    });

    it('DELETE /boards/:id - should fail if user is not admin', async () => {
      // Create a writer user
      const writerLogin = `writer-user-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/users/register')
        .send({ login: writerLogin, password: 'password' });
      const writerLoginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: writerLogin, password: 'password' });
      const writerJwt = writerLoginRes.body.access_token;

      await request(app.getHttpServer())
        .post('/board-members')
        .set('Authorization', `Bearer ${jwt}`)
        .send({ boardId, userLogin: writerLogin, permissions: 'write' });

      // Writer tries to delete
      await request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${writerJwt}`)
        .expect(403);
    });

    it('DELETE /boards/:id - should delete the board successfully', () => {
      return request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(204);
    });

    it('DELETE /boards/:id - should fail if board is already deleted', () => {
      return request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(404);
    });
  });
});