import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private ok<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data };
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(user.userId, dto);
    return this.ok(project);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    const projects = await this.projectsService.findAllForUser(user.userId);
    return this.ok(projects);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const project = await this.projectsService.findOneForUser(id, user.userId);
    return this.ok(project);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(id, user.userId, dto);
    return this.ok(project);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.projectsService.remove(id, user.userId);
    return this.ok({ deleted: true });
  }

  @Post(':id/members')
  async addMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    const member = await this.projectsService.addMember(id, user.userId, dto);
    return this.ok(member);
  }

  @Delete(':id/members/:memberUserId')
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    await this.projectsService.removeMember(id, user.userId, memberUserId);
    return this.ok({ removed: true, memberUserId });
  }
}
