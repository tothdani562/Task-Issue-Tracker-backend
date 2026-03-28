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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('projects')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private ok<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ description: 'Project created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(user.userId, dto);
    return this.ok(project);
  }

  @Get()
  @ApiOperation({
    summary: 'List projects where current user is owner or member',
  })
  @ApiOkResponse({ description: 'Projects list returned' })
  async findAll(@CurrentUser() user: AuthUser) {
    const projects = await this.projectsService.findAllForUser(user.userId);
    return this.ok(projects);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one project by ID' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ description: 'Project returned' })
  @ApiForbiddenResponse({ description: 'No access to this project' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const project = await this.projectsService.findOneForUser(id, user.userId);
    return this.ok(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details (owner only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ description: 'Project updated successfully' })
  @ApiForbiddenResponse({ description: 'Only project owner can update' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(id, user.userId, dto);
    return this.ok(project);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project (owner only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiForbiddenResponse({ description: 'Only project owner can delete' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.projectsService.remove(id, user.userId);
    return this.ok({ deleted: true });
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project (owner only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiCreatedResponse({ description: 'Member added to project' })
  @ApiForbiddenResponse({ description: 'Only project owner can add member' })
  async addMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    const member = await this.projectsService.addMember(id, user.userId, dto);
    return this.ok(member);
  }

  @Delete(':id/members/:memberUserId')
  @ApiOperation({ summary: 'Remove member from project (owner only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiParam({ name: 'memberUserId', description: 'Member user UUID' })
  @ApiOkResponse({ description: 'Member removed from project' })
  @ApiForbiddenResponse({ description: 'Only project owner can remove member' })
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    await this.projectsService.removeMember(id, user.userId, memberUserId);
    return this.ok({ removed: true, memberUserId });
  }
}
