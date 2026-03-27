import { BadRequestException } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';

describe('TasksService - iteration 4 listing', () => {
  let service: TasksService;

  const prisma = {
    task: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    ),
  };

  const projectsService = {
    assertProjectAccess: jest.fn().mockResolvedValue(undefined),
  };

  const usersService = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService(
      prisma as never,
      projectsService as never,
      usersService as never,
    );
  });

  it('builds dynamic where and orderBy for advanced query params', async () => {
    prisma.task.count.mockResolvedValue(2);
    prisma.task.findMany.mockResolvedValue([]);

    await service.findAllForProject('project-1', 'user-1', {
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: '00000000-0000-4000-8000-000000000001',
      dueFrom: '2026-03-01T00:00:00.000Z',
      dueTo: '2026-03-31T23:59:59.000Z',
      sortBy: 'dueDate' as never,
      sortOrder: 'asc' as never,
      page: 2,
      limit: 10,
    });

    expect(projectsService.assertProjectAccess).toHaveBeenCalledWith(
      'project-1',
      'user-1',
    );

    expect(prisma.task.count).toHaveBeenCalledWith({
      where: {
        projectId: 'project-1',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assignedUserId: '00000000-0000-4000-8000-000000000001',
        dueDate: {
          gte: new Date('2026-03-01T00:00:00.000Z'),
          lte: new Date('2026-03-31T23:59:59.000Z'),
        },
      },
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 'project-1',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assignedUserId: '00000000-0000-4000-8000-000000000001',
        dueDate: {
          gte: new Date('2026-03-01T00:00:00.000Z'),
          lte: new Date('2026-03-31T23:59:59.000Z'),
        },
      },
      skip: 10,
      take: 10,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('throws on invalid due date range', async () => {
    await expect(
      service.findAllForProject('project-1', 'user-1', {
        dueFrom: '2026-04-01T00:00:00.000Z',
        dueTo: '2026-03-01T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.task.count).not.toHaveBeenCalled();
    expect(prisma.task.findMany).not.toHaveBeenCalled();
  });
});
