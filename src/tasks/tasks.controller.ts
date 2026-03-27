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

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private ok<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data };
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(projectId, user.userId, dto);
    return this.ok(task);
  }

  @Get()
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
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    await this.tasksService.removeForProject(projectId, taskId, user.userId);
    return this.ok({ deleted: true });
  }
}
