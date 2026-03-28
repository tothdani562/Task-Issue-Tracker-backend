import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

type AuthBody = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
};

const registerUser = async (
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<AuthBody> => {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password })
    .expect(201);

  return response.body as AuthBody;
};

const loginUser = async (
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<AuthBody> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return response.body as AuthBody;
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('auth flow: register -> login -> me', async () => {
    const email = `user_${Date.now()}@example.com`;
    const password = 'Password123';

    const registerBody = await registerUser(app, email, password);
    expect(typeof registerBody.accessToken).toBe('string');
    expect(typeof registerBody.refreshToken).toBe('string');
    expect(registerBody.user.email).toBe(email);

    const loginBody = await loginUser(app, email, password);
    const token = loginBody.accessToken;

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
    expect(typeof loginBody.refreshToken).toBe('string');
    expect(loginBody.refreshToken.length).toBeGreaterThan(20);

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body).toHaveProperty('user.email', email);
  });

  it('projects access: non-owner cannot modify foreign project and member can read', async () => {
    const seed = Date.now();
    const password = 'Password123';

    const owner = await registerUser(
      app,
      `owner_${seed}@example.com`,
      password,
    );
    const member = await registerUser(
      app,
      `member_${seed}@example.com`,
      password,
    );
    const outsider = await registerUser(
      app,
      `outsider_${seed}@example.com`,
      password,
    );

    const createProjectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Iteration 2 Project', description: 'Access-control test' })
      .expect(201);

    const createProjectBody = createProjectResponse.body as {
      success: true;
      data: { id: string };
    };
    expect(createProjectBody.success).toBe(true);
    const projectId = createProjectBody.data.id;
    expect(typeof projectId).toBe('string');

    const addMemberResponse = await request(app.getHttpServer())
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ userId: member.user.id })
      .expect(201);
    expect((addMemberResponse.body as { success: boolean }).success).toBe(true);

    const getProjectAsMemberResponse = await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(200);
    expect(
      (
        getProjectAsMemberResponse.body as {
          success: boolean;
          data: { id: string };
        }
      ).success,
    ).toBe(true);

    const removeMemberResponse = await request(app.getHttpServer())
      .delete(`/projects/${projectId}/members/${member.user.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(
      (
        removeMemberResponse.body as {
          success: boolean;
          data: { removed: boolean; memberUserId: string };
        }
      ).data.removed,
    ).toBe(true);

    await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .send({ name: 'Unauthorized update' })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(403);

    const updateAsOwnerResponse = await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Authorized update' })
      .expect(200);
    expect((updateAsOwnerResponse.body as { success: boolean }).success).toBe(
      true,
    );
  });

  it('auth hardening: refresh rotates token and logout revokes it', async () => {
    const seed = Date.now();
    const email = `rotation_${seed}@example.com`;
    const password = 'Password123';

    const registered = await registerUser(app, email, password);
    const initialRefreshToken = registered.refreshToken;

    const refreshedResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: initialRefreshToken })
      .expect(201);

    const refreshed = refreshedResponse.body as AuthBody;
    expect(typeof refreshed.accessToken).toBe('string');
    expect(typeof refreshed.refreshToken).toBe('string');

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: `${initialRefreshToken}tampered` })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshed.accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshed.refreshToken })
      .expect(401);
  });

  it('tasks: filtering, pagination and invalid due range are enforced', async () => {
    const seed = Date.now();
    const password = 'Password123';

    const owner = await registerUser(
      app,
      `task_owner_${seed}@example.com`,
      password,
    );
    const member = await registerUser(
      app,
      `task_member_${seed}@example.com`,
      password,
    );

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        name: 'Tasks Query Regression Project',
        description: 'Iteration 7 task query checks',
      })
      .expect(201);

    const projectId = (
      projectResponse.body as { success: true; data: { id: string } }
    ).data.id;

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ userId: member.user.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        title: 'Task One',
        status: 'TODO',
        priority: 'HIGH',
        assignedUserId: member.user.id,
        dueDate: '2031-01-01T00:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        title: 'Task Two',
        status: 'DONE',
        priority: 'LOW',
        dueDate: '2031-02-01T00:00:00.000Z',
      })
      .expect(201);

    const filteredTasksResponse = await request(app.getHttpServer())
      .get(
        `/projects/${projectId}/tasks?status=TODO&priority=HIGH&assigneeId=${member.user.id}&page=1&limit=1&sortBy=dueDate&sortOrder=asc`,
      )
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const filteredTasksBody = filteredTasksResponse.body as {
      success: true;
      data: {
        items: Array<{ title: string; status: string; priority: string }>;
        meta: { total: number; page: number; limit: number; hasNext: boolean };
      };
    };

    expect(filteredTasksBody.success).toBe(true);
    expect(filteredTasksBody.data.meta.total).toBe(1);
    expect(filteredTasksBody.data.meta.page).toBe(1);
    expect(filteredTasksBody.data.meta.limit).toBe(1);
    expect(filteredTasksBody.data.meta.hasNext).toBe(false);
    expect(filteredTasksBody.data.items).toHaveLength(1);
    expect(filteredTasksBody.data.items[0].title).toBe('Task One');

    const invalidRangeResponse = await request(app.getHttpServer())
      .get(
        `/projects/${projectId}/tasks?dueFrom=2031-03-01T00:00:00.000Z&dueTo=2031-01-01T00:00:00.000Z`,
      )
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(400);

    expect(invalidRangeResponse.body).toHaveProperty(
      'message',
      'dueFrom must be earlier than dueTo',
    );
  });

  it('comments: user can comment on tasks, only author/owner can modify', async () => {
    const seed = Date.now();
    const password = 'Password123';

    const owner = await registerUser(
      app,
      `owner_comment_${seed}@example.com`,
      password,
    );
    const member = await registerUser(
      app,
      `member_comment_${seed}@example.com`,
      password,
    );

    // Owner creates project
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        name: 'Comments Test Project',
        description: 'Comments iteration test',
      })
      .expect(201);
    const projectId = (
      projectResponse.body as { success: boolean; data: { id: string } }
    ).data.id;

    // Owner creates task
    const taskResponse = await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ title: 'Test Task', description: 'Task for comments' })
      .expect(201);
    const taskId = (
      taskResponse.body as { success: boolean; data: { id: string } }
    ).data.id;

    // Add member to project
    await request(app.getHttpServer())
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ userId: member.user.id })
      .expect(201);

    // Member can comment on task
    interface IComment {
      id: string;
      content: string;
      authorId: string;
    }
    const memberCommentResponse = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ content: 'Member comment' })
      .expect(201);
    const memberCommentBody = memberCommentResponse.body as IComment;
    const memberCommentId = memberCommentBody.id;

    // Owner can also comment on task (they are project owner)
    const ownerCommentResponse = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ content: 'Owner comment' })
      .expect(201);
    const ownerCommentBody = ownerCommentResponse.body as IComment;
    const ownerCommentId = ownerCommentBody.id;

    // List comments on task
    interface CommentsListResponse {
      data: { id: string }[];
      pagination: { total: number };
    }
    const listCommentsResponse = await request(app.getHttpServer())
      .get(`/tasks/${taskId}/comments?page=1&limit=20`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(200);
    const commentsList = listCommentsResponse.body as CommentsListResponse;
    expect(commentsList.data || commentsList.pagination).toBeDefined();

    // Get specific comment
    await request(app.getHttpServer())
      .get(`/tasks/${taskId}/comments/${memberCommentId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    // Member cannot update owner's comment
    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/comments/${ownerCommentId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ content: 'Malicious update' })
      .expect(403);

    // Member can update own comment
    const modifiedMemberCommentResponse = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/comments/${memberCommentId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ content: 'Updated member comment' })
      .expect(200);
    const modifiedCommentBody = modifiedMemberCommentResponse.body as IComment;
    expect(modifiedCommentBody.content).toBe('Updated member comment');

    // Owner can update member's comment
    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/comments/${memberCommentId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ content: 'Owner updated member comment' })
      .expect(200);

    // Member cannot delete owner's comment
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}/comments/${ownerCommentId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(403);

    // Member can delete own comment
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/tasks/${taskId}/comments/${memberCommentId}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(204);
    expect(deleteResponse.body).toEqual({});

    // Owner can delete any comment
    const ownerDeleteResponse = await request(app.getHttpServer())
      .delete(`/tasks/${taskId}/comments/${ownerCommentId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(204);
    expect(ownerDeleteResponse.body).toEqual({});
  });
});
