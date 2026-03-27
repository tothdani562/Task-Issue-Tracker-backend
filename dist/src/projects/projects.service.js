"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma/prisma.service");
const users_service_1 = require("../users/users.service");
let ProjectsService = class ProjectsService {
    prisma;
    usersService;
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async create(userId, dto) {
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
                    role: client_1.ProjectMemberRole.OWNER,
                },
            });
            return project;
        });
    }
    findAllForUser(userId) {
        return this.prisma.project.findMany({
            where: {
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneForUser(projectId, userId) {
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
    async update(projectId, userId, dto) {
        await this.assertProjectOwner(projectId, userId);
        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                name: dto.name,
                description: dto.description,
            },
        });
    }
    async remove(projectId, userId) {
        await this.assertProjectOwner(projectId, userId);
        await this.prisma.project.delete({
            where: { id: projectId },
        });
    }
    async addMember(projectId, userId, dto) {
        await this.assertProjectOwner(projectId, userId);
        const memberUser = await this.usersService.findById(dto.userId);
        if (!memberUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.userId === userId) {
            throw new common_1.ConflictException('Owner is already part of the project');
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
                role: client_1.ProjectMemberRole.MEMBER,
            },
            update: {},
        });
    }
    async removeMember(projectId, userId, memberUserId) {
        await this.assertProjectOwner(projectId, userId);
        if (memberUserId === userId) {
            throw new common_1.ConflictException('Owner cannot be removed from the project');
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
            throw new common_1.NotFoundException('Project member not found');
        }
        if (membership.role === client_1.ProjectMemberRole.OWNER) {
            throw new common_1.ConflictException('Owner membership cannot be removed');
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
    async assertProjectAccess(projectId, userId) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
            },
            select: { id: true },
        });
        if (!project) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
    }
    async assertProjectOwner(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the project owner can perform this action');
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map