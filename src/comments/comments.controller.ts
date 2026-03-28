import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tasks/:taskId/comments')
  async create(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(taskId, user.userId, dto);
  }

  @Get('tasks/:taskId/comments')
  async findAllForTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Query() query: ListCommentsQueryDto,
  ) {
    return this.commentsService.findAllForTask(taskId, user.userId, query);
  }

  @Get('tasks/:taskId/comments/:commentId')
  async findOne(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.findOne(commentId, user.userId);
  }

  @Patch('tasks/:taskId/comments/:commentId')
  async update(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(commentId, user.userId, dto);
  }

  @Delete('tasks/:taskId/comments/:commentId')
  @HttpCode(204)
  async remove(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.commentsService.remove(commentId, user.userId);
  }
}
