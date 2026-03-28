import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

@ApiTags('tasks')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private ok<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create task in a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiCreatedResponse({ description: 'Task created successfully' })
  @ApiForbiddenResponse({ description: 'No project access' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async create(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(projectId, user.userId, dto);
    return this.ok(task);
  }

  @Get()
  @ApiOperation({
    summary: 'List tasks in project with filtering and pagination',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({ name: 'status', required: false, description: 'Task status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Task priority' })
  @ApiQuery({
    name: 'assigneeId',
    required: false,
    description: 'Assignee user UUID',
  })
  @ApiQuery({
    name: 'dueFrom',
    required: false,
    description: 'Lower due-date bound (ISO date)',
  })
  @ApiQuery({
    name: 'dueTo',
    required: false,
    description: 'Upper due-date bound (ISO date)',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort direction (asc or desc)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (>=1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size (1-100)',
  })
  @ApiOkResponse({ description: 'Paginated task list returned' })
  @ApiForbiddenResponse({ description: 'No project access' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    const result = await this.tasksService.findAllForProject(
      projectId,
      user.userId,
      query,
    );
    return this.ok(result);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get one task in project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Task returned' })
  @ApiForbiddenResponse({ description: 'No project access' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const task = await this.tasksService.findOneForProject(
      projectId,
      taskId,
      user.userId,
    );
    return this.ok(task);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update task in project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Task updated successfully' })
  @ApiForbiddenResponse({ description: 'No project access' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.updateForProject(
      projectId,
      taskId,
      user.userId,
      dto,
    );
    return this.ok(task);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete task in project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Task deleted successfully' })
  @ApiForbiddenResponse({ description: 'No project access' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    await this.tasksService.removeForProject(projectId, taskId, user.userId);
    return this.ok({ deleted: true });
  }
}
