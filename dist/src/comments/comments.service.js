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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const projects_service_1 = require("../projects/projects.service");
let CommentsService = class CommentsService {
    prisma;
    projectsService;
    constructor(prisma, projectsService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
    }
    async create(taskId, userId, dto) {
        const task = await this.findTaskWithProject(taskId);
        await this.assertUserIsProjectMember(task.projectId, userId);
        return this.prisma.comment.create({
            data: {
                taskId,
                authorId: userId,
                content: dto.content,
            },
            include: {
                author: { select: { id: true, email: true } },
            },
        });
    }
    async findAllForTask(taskId, userId, query) {
        const task = await this.findTaskWithProject(taskId);
        await this.assertUserIsProjectMember(task.projectId, userId);
        const page = query.page > 0 ? query.page : 1;
        const limit = Math.min(query.limit > 0 ? query.limit : 20, 100);
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: { taskId },
                include: {
                    author: { select: { id: true, email: true } },
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.comment.count({ where: { taskId } }),
        ]);
        return {
            data: comments,
            pagination: {
                total,
                page,
                limit,
                hasNext: skip + comments.length < total,
            },
        };
    }
    async findOne(id, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, email: true } },
                task: { select: { projectId: true } },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        await this.assertUserIsProjectMember(comment.task.projectId, userId);
        return comment;
    }
    async update(id, userId, dto) {
        const comment = await this.findCommentWithTask(id);
        await this.assertUserCanModifyComment(comment.task.projectId, comment.authorId, userId);
        if (dto.content === undefined) {
            throw new common_1.BadRequestException('Content must be provided for update');
        }
        return this.prisma.comment.update({
            where: { id },
            data: {
                content: dto.content,
            },
            include: {
                author: { select: { id: true, email: true } },
            },
        });
    }
    async remove(id, userId) {
        const comment = await this.findCommentWithTask(id);
        await this.assertUserCanModifyComment(comment.task.projectId, comment.authorId, userId);
        return this.prisma.comment.delete({
            where: { id },
            include: {
                author: { select: { id: true, email: true } },
            },
        });
    }
    async findTaskWithProject(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: { projectId: true },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${taskId} not found`);
        }
        return task;
    }
    async findCommentWithTask(id) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                task: { select: { projectId: true } },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        return comment;
    }
    async assertUserIsProjectMember(projectId, userId) {
        const isMember = await this.projectsService.isUserProjectMember(projectId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this project');
        }
    }
    async assertUserCanModifyComment(projectId, commentAuthorId, userId) {
        const isAuthor = commentAuthorId === userId;
        const isProjectOwner = await this.projectsService.isUserProjectOwner(projectId, userId);
        if (!isAuthor && !isProjectOwner) {
            throw new common_1.ForbiddenException('You can only modify your own comments or comments in projects you own');
        }
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map