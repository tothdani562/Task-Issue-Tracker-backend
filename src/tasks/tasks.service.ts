import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  ListTasksQueryDto,
  SortOrder,
  TaskSortBy,
} from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateTaskDto) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    if (dto.assignedUserId) {
      await this.assertAssigneeIsProjectMember(projectId, dto.assignedUserId);
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId,
        assignedUserId: dto.assignedUserId,
      },
    });
  }

  async findAllForProject(
    projectId: string,
    userId: string,
    query: ListTasksQueryDto,
  ) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.buildTaskListWhere(projectId, query);
    const orderBy = this.buildTaskListOrderBy(query);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        hasNext: page * limit < total,
      },
    };
  }

  async findOneForProject(projectId: string, taskId: string, userId: string) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateForProject(
    projectId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ) {
    await this.projectsService.assertProjectAccess(projectId, userId);
    const task = await this.getTaskForProjectOrThrow(projectId, taskId);

    if (dto.assignedUserId) {
      await this.assertAssigneeIsProjectMember(projectId, dto.assignedUserId);
    }

    return this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assignedUserId: dto.assignedUserId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async removeForProject(projectId: string, taskId: string, userId: string) {
    await this.projectsService.assertProjectAccess(projectId, userId);
    const task = await this.getTaskForProjectOrThrow(projectId, taskId);

    await this.prisma.task.delete({
      where: { id: task.id },
    });
  }

  private async getTaskForProjectOrThrow(
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async assertAssigneeIsProjectMember(
    projectId: string,
    assignedUserId: string,
  ): Promise<void> {
    const user = await this.usersService.findById(assignedUserId);
    if (!user) {
      throw new NotFoundException('Assigned user not found');
    }

    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: assignedUserId,
        },
      },
      select: { id: true },
    });

    if (!member) {
      throw new BadRequestException('Assigned user must be a project member');
    }
  }

  private buildTaskListWhere(
    projectId: string,
    query: ListTasksQueryDto,
  ): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = { projectId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.assigneeId) {
      where.assignedUserId = query.assigneeId;
    }

    const dueFromDate = query.dueFrom ? new Date(query.dueFrom) : undefined;
    const dueToDate = query.dueTo ? new Date(query.dueTo) : undefined;

    if (dueFromDate && dueToDate && dueFromDate > dueToDate) {
      throw new BadRequestException('dueFrom must be earlier than dueTo');
    }

    if (dueFromDate || dueToDate) {
      where.dueDate = {};

      if (dueFromDate) {
        where.dueDate.gte = dueFromDate;
      }

      if (dueToDate) {
        where.dueDate.lte = dueToDate;
      }
    }

    return where;
  }

  private buildTaskListOrderBy(
    query: ListTasksQueryDto,
  ): Prisma.TaskOrderByWithRelationInput[] {
    const sortBy = query.sortBy ?? TaskSortBy.CREATED_AT;
    const sortOrder: Prisma.SortOrder =
      query.sortOrder === SortOrder.ASC ? 'asc' : 'desc';

    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      { [sortBy]: sortOrder } as Prisma.TaskOrderByWithRelationInput,
    ];

    if (sortBy !== TaskSortBy.CREATED_AT) {
      orderBy.push({ createdAt: 'desc' });
    }

    return orderBy;
  }
}
