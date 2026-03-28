import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(taskId: string, userId: string, dto: CreateCommentDto) {
    const task = await this.findTaskWithProject(taskId);

    await this.assertUserIsProjectMember(task.projectId, userId);

    return this.prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        content: dto.content,
      },
      include: {
        author: { select: { id: true, email: true } },
      },
    });
  }

  async findAllForTask(
    taskId: string,
    userId: string,
    query: ListCommentsQueryDto,
  ) {
    const task = await this.findTaskWithProject(taskId);

    await this.assertUserIsProjectMember(task.projectId, userId);

    const page = query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit > 0 ? query.limit : 20, 100);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { taskId },
        include: {
          author: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { taskId } }),
    ]);

    return {
      data: comments,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + comments.length < total,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true } },
        task: { select: { projectId: true } },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.assertUserIsProjectMember(comment.task.projectId, userId);

    return comment;
  }

  async update(id: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.findCommentWithTask(id);

    await this.assertUserCanModifyComment(
      comment.task.projectId,
      comment.authorId,
      userId,
    );

    if (dto.content === undefined) {
      throw new BadRequestException('Content must be provided for update');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
      include: {
        author: { select: { id: true, email: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.findCommentWithTask(id);

    await this.assertUserCanModifyComment(
      comment.task.projectId,
      comment.authorId,
      userId,
    );

    return this.prisma.comment.delete({
      where: { id },
      include: {
        author: { select: { id: true, email: true } },
      },
    });
  }

  private async findTaskWithProject(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return task;
  }

  private async findCommentWithTask(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        task: { select: { projectId: true } },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  private async assertUserIsProjectMember(projectId: string, userId: string) {
    const isMember = await this.projectsService.isUserProjectMember(
      projectId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }
  }

  private async assertUserCanModifyComment(
    projectId: string,
    commentAuthorId: string,
    userId: string,
  ) {
    const isAuthor = commentAuthorId === userId;
    const isProjectOwner = await this.projectsService.isUserProjectOwner(
      projectId,
      userId,
    );

    if (!isAuthor && !isProjectOwner) {
      throw new ForbiddenException(
        'You can only modify your own comments or comments in projects you own',
      );
    }
  }
}
