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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@ApiBearerAuth('bearer')
@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Create comment on a task' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiCreatedResponse({ description: 'Comment created successfully' })
  @ApiForbiddenResponse({ description: 'No project membership for this task' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async create(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(taskId, user.userId, dto);
  }

  @Get('tasks/:taskId/comments')
  @ApiOperation({ summary: 'List comments for task with pagination' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (>=1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size (1-100)',
  })
  @ApiOkResponse({ description: 'Comments list returned' })
  @ApiForbiddenResponse({ description: 'No project membership for this task' })
  async findAllForTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Query() query: ListCommentsQueryDto,
  ) {
    return this.commentsService.findAllForTask(taskId, user.userId, query);
  }

  @Get('tasks/:taskId/comments/:commentId')
  @ApiOperation({ summary: 'Get a single comment by ID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiOkResponse({ description: 'Comment returned' })
  @ApiForbiddenResponse({ description: 'No project membership for this task' })
  async findOne(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commentsService.findOne(commentId, user.userId);
  }

  @Patch('tasks/:taskId/comments/:commentId')
  @ApiOperation({ summary: 'Update comment (author or project owner)' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiOkResponse({ description: 'Comment updated successfully' })
  @ApiForbiddenResponse({
    description: 'Insufficient permission to update comment',
  })
  async update(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(commentId, user.userId, dto);
  }

  @Delete('tasks/:taskId/comments/:commentId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete comment (author or project owner)' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiNoContentResponse({ description: 'Comment deleted successfully' })
  @ApiForbiddenResponse({
    description: 'Insufficient permission to delete comment',
  })
  async remove(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.commentsService.remove(commentId, user.userId);
  }
}
