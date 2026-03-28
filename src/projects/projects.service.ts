import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectMemberRole } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          ownerId: userId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: ProjectMemberRole.OWNER,
        },
      });

      return project;
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(projectId: string, userId: string) {
    await this.assertProjectAccess(projectId, userId);
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    await this.assertProjectOwner(projectId, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async remove(projectId: string, userId: string) {
    await this.assertProjectOwner(projectId, userId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  async addMember(projectId: string, userId: string, dto: AddProjectMemberDto) {
    await this.assertProjectOwner(projectId, userId);

    const memberUser = await this.usersService.findById(dto.userId);
    if (!memberUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.userId === userId) {
      throw new ConflictException('Owner is already part of the project');
    }

    return this.prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
      create: {
        projectId,
        userId: dto.userId,
        role: ProjectMemberRole.MEMBER,
      },
      update: {},
    });
  }

  async removeMember(projectId: string, userId: string, memberUserId: string) {
    await this.assertProjectOwner(projectId, userId);

    if (memberUserId === userId) {
      throw new ConflictException('Owner cannot be removed from the project');
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId,
        },
      },
      select: { id: true, role: true },
    });

    if (!membership) {
      throw new NotFoundException('Project member not found');
    }

    if (membership.role === ProjectMemberRole.OWNER) {
      throw new ConflictException('Owner membership cannot be removed');
    }

    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId,
        },
      },
    });
  }

  async assertProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }

  async assertProjectOwner(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can perform this action',
      );
    }
  }

  async isUserProjectMember(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    return !!project;
  }

  async isUserProjectOwner(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    return project?.ownerId === userId;
  }
}
