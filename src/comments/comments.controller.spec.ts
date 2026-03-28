import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockCommentsService = {
    create: jest.fn(),
    findAllForTask: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { userId: 'user-1', email: 'user@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const taskId = 'task-1';
      const createCommentDto = { content: 'Test comment' };
      const mockComment = {
        id: 'comment-1',
        taskId,
        authorId: mockUser.userId,
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
      };

      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(
        taskId,
        mockUser,
        createCommentDto,
      );

      expect(mockCommentsService.create).toHaveBeenCalledWith(
        taskId,
        mockUser.userId,
        createCommentDto,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw ForbiddenException', async () => {
      const taskId = 'task-1';
      const createCommentDto = { content: 'Test comment' };

      mockCommentsService.create.mockRejectedValue(new ForbiddenException());

      await expect(
        controller.create(taskId, mockUser, createCommentDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllForTask', () => {
    it('should return comments for task', async () => {
      const taskId = 'task-1';
      const query = { page: 1, limit: 20 };
      const mockResponse = {
        data: [
          {
            id: 'comment-1',
            taskId,
            authorId: mockUser.userId,
            content: 'Test comment',
            createdAt: new Date(),
            updatedAt: new Date(),
            author: mockUser,
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, hasNext: false },
      };

      mockCommentsService.findAllForTask.mockResolvedValue(mockResponse);

      const result = await controller.findAllForTask(taskId, mockUser, query);

      expect(mockCommentsService.findAllForTask).toHaveBeenCalledWith(
        taskId,
        mockUser.userId,
        query,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a comment', async () => {
      const commentId = 'comment-1';
      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: mockUser.userId,
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
        task: { projectId: 'project-1' },
      };

      mockCommentsService.findOne.mockResolvedValue(mockComment);

      const result = await controller.findOne(commentId, mockUser);

      expect(mockCommentsService.findOne).toHaveBeenCalledWith(
        commentId,
        mockUser.userId,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException', async () => {
      const commentId = 'non-existent';

      mockCommentsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(commentId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const commentId = 'comment-1';
      const updateCommentDto = { content: 'Updated comment' };
      const mockComment = {
        id: commentId,
        taskId: 'task-1',
        authorId: mockUser.userId,
        content: 'Updated comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
      };

      mockCommentsService.update.mockResolvedValue(mockComment);

      const result = await controller.update(
        commentId,
        mockUser,
        updateCommentDto,
      );

      expect(mockCommentsService.update).toHaveBeenCalledWith(
        commentId,
        mockUser.userId,
        updateCommentDto,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw ForbiddenException when updating others comment', async () => {
      const commentId = 'comment-1';
      const updateCommentDto = { content: 'Updated comment' };

      mockCommentsService.update.mockRejectedValue(new ForbiddenException());

      await expect(
        controller.update(commentId, mockUser, updateCommentDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const commentId = 'comment-1';

      mockCommentsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(commentId, mockUser);

      expect(mockCommentsService.remove).toHaveBeenCalledWith(
        commentId,
        mockUser.userId,
      );
      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenException when removing others comment', async () => {
      const commentId = 'comment-1';

      mockCommentsService.remove.mockRejectedValue(new ForbiddenException());

      await expect(controller.remove(commentId, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
