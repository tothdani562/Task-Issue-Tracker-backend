import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
  };

  const mockProjectsService = {
    isUserProjectMember: jest.fn(),
    isUserProjectOwner: jest.fn(),
  };

  const mockTasksService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment when user is project member', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const projectId = 'project-1';
      const createCommentDto = { content: 'Test comment' };

      const mockComment = {
        id: 'comment-1',
        taskId,
        authorId: userId,
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: userId, email: 'user@example.com' },
      };

      mockPrismaService.task.findUnique.mockResolvedValue({
        projectId,
      });
      mockProjectsService.isUserProjectMember.mockResolvedValue(true);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.create(taskId, userId, createCommentDto);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        select: { projectId: true },
      });
      expect(mockProjectsService.isUserProjectMember).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          taskId,
          authorId: userId,
          content: 'Test comment',
        },
        include: {
          author: { select: { id: true, email: true } },
        },
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = 'non-existent';
      const userId = 'user-1';
      const createCommentDto = { content: 'Test comment' };

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(
        service.create(taskId, userId, createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not project member', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const projectId = 'project-1';
      const createCommentDto = { content: 'Test comment' };

      mockPrismaService.task.findUnique.mockResolvedValue({
        projectId,
      });
      mockProjectsService.isUserProjectMember.mockResolvedValue(false);

      await expect(
        service.create(taskId, userId, createCommentDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllForTask', () => {
    it('should return comments with pagination for task', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      const mockComments = [
        {
          id: 'comment-1',
          taskId,
          authorId: userId,
          content: 'Test comment 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { id: userId, email: 'user@example.com' },
        },
        {
          id: 'comment-2',
          taskId,
          authorId: userId,
          content: 'Test comment 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { id: userId, email: 'user@example.com' },
        },
      ];

      mockPrismaService.task.findUnique.mockResolvedValue({
        projectId,
      });
      mockProjectsService.isUserProjectMember.mockResolvedValue(true);
      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);
      mockPrismaService.comment.count.mockResolvedValue(2);

      const result = await service.findAllForTask(taskId, userId, {
        page: 1,
        limit: 20,
      });

      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.data).toEqual(mockComments);
    });

    it('should throw ForbiddenException if user is not project member', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      mockPrismaService.task.findUnique.mockResolvedValue({
        projectId,
      });
      mockProjectsService.isUserProjectMember.mockResolvedValue(false);

      await expect(
        service.findAllForTask(taskId, userId, { page: 1, limit: 20 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return a comment for project member', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: userId,
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: userId, email: 'user@example.com' },
        task: { projectId },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockProjectsService.isUserProjectMember.mockResolvedValue(true);

      const result = await service.findOne(commentId, userId);

      expect(mockProjectsService.isUserProjectMember).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      const commentId = 'non-existent';
      const userId = 'user-1';

      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(commentId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not project member', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: 'different-user',
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 'different-user', email: 'other@example.com' },
        task: { projectId },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockProjectsService.isUserProjectMember.mockResolvedValue(false);

      await expect(service.findOne(commentId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update comment if user is author', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';
      const updateCommentDto = { content: 'Updated comment' };

      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: userId,
        content: 'Updated comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: userId, email: 'user@example.com' },
        task: { projectId },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        taskId: 'task-1',
        authorId: userId,
        content: 'Original comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        task: { projectId },
      });
      mockProjectsService.isUserProjectOwner.mockResolvedValue(false);
      mockPrismaService.comment.update.mockResolvedValue(mockComment);

      const result = await service.update(commentId, userId, updateCommentDto);

      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { content: 'Updated comment' },
        include: { author: { select: { id: true, email: true } } },
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw ForbiddenException if user is not author or project owner', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';
      const updateCommentDto = { content: 'Updated comment' };

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        taskId: 'task-1',
        authorId: 'different-user',
        content: 'Original comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        task: { projectId },
      });
      mockProjectsService.isUserProjectOwner.mockResolvedValue(false);

      await expect(
        service.update(commentId, userId, updateCommentDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete comment if user is author', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: userId,
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: userId, email: 'user@example.com' },
        task: { projectId },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        taskId: 'task-1',
        authorId: userId,
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        task: { projectId },
      });
      mockProjectsService.isUserProjectOwner.mockResolvedValue(false);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      const result = await service.remove(commentId, userId);

      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
        include: { author: { select: { id: true, email: true } } },
      });
      expect(result).toEqual(mockComment);
    });

    it('should delete comment if user is project owner', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: 'different-user',
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 'different-user', email: 'other@example.com' },
        task: { projectId },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        taskId: 'task-1',
        authorId: 'different-user',
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        task: { projectId },
      });
      mockProjectsService.isUserProjectOwner.mockResolvedValue(true);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      const result = await service.remove(commentId, userId);

      expect(mockPrismaService.comment.delete).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it('should throw ForbiddenException if user is not author or project owner', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';
      const projectId = 'project-1';

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        taskId: 'task-1',
        authorId: 'different-user',
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        task: { projectId },
      });
      mockProjectsService.isUserProjectOwner.mockResolvedValue(false);

      await expect(service.remove(commentId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
