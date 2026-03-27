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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const users_service_1 = require("../users/users.service");
const list_tasks_query_dto_1 = require("./dto/list-tasks-query.dto");
let TasksService = class TasksService {
    prisma;
    projectsService;
    usersService;
    constructor(prisma, projectsService, usersService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
        this.usersService = usersService;
    }
    async create(projectId, userId, dto) {
        await this.projectsService.assertProjectAccess(projectId, userId);
        if (dto.assignedUserId) {
            await this.assertAssigneeIsProjectMember(projectId, dto.assignedUserId);
        }
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                priority: dto.priority,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                projectId,
                assignedUserId: dto.assignedUserId,
            },
        });
    }
    async findAllForProject(projectId, userId, query) {
        await this.projectsService.assertProjectAccess(projectId, userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = this.buildTaskListWhere(projectId, query);
        const orderBy = this.buildTaskListOrderBy(query);
        const [total, items] = await this.prisma.$transaction([
            this.prisma.task.count({ where }),
            this.prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                hasNext: page * limit < total,
            },
        };
    }
    async findOneForProject(projectId, taskId, userId) {
        await this.projectsService.assertProjectAccess(projectId, userId);
        const task = await this.prisma.task.findFirst({
            where: {
                id: taskId,
                projectId,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async updateForProject(projectId, taskId, userId, dto) {
        await this.projectsService.assertProjectAccess(projectId, userId);
        const task = await this.getTaskForProjectOrThrow(projectId, taskId);
        if (dto.assignedUserId) {
            await this.assertAssigneeIsProjectMember(projectId, dto.assignedUserId);
        }
        return this.prisma.task.update({
            where: { id: task.id },
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                priority: dto.priority,
                assignedUserId: dto.assignedUserId,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            },
        });
    }
    async removeForProject(projectId, taskId, userId) {
        await this.projectsService.assertProjectAccess(projectId, userId);
        const task = await this.getTaskForProjectOrThrow(projectId, taskId);
        await this.prisma.task.delete({
            where: { id: task.id },
        });
    }
    async getTaskForProjectOrThrow(projectId, taskId) {
        const task = await this.prisma.task.findFirst({
            where: {
                id: taskId,
                projectId,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async assertAssigneeIsProjectMember(projectId, assignedUserId) {
        const user = await this.usersService.findById(assignedUserId);
        if (!user) {
            throw new common_1.NotFoundException('Assigned user not found');
        }
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: assignedUserId,
                },
            },
            select: { id: true },
        });
        if (!member) {
            throw new common_1.BadRequestException('Assigned user must be a project member');
        }
    }
    buildTaskListWhere(projectId, query) {
        const where = { projectId };
        if (query.status) {
            where.status = query.status;
        }
        if (query.priority) {
            where.priority = query.priority;
        }
        if (query.assigneeId) {
            where.assignedUserId = query.assigneeId;
        }
        const dueFromDate = query.dueFrom ? new Date(query.dueFrom) : undefined;
        const dueToDate = query.dueTo ? new Date(query.dueTo) : undefined;
        if (dueFromDate && dueToDate && dueFromDate > dueToDate) {
            throw new common_1.BadRequestException('dueFrom must be earlier than dueTo');
        }
        if (dueFromDate || dueToDate) {
            where.dueDate = {};
            if (dueFromDate) {
                where.dueDate.gte = dueFromDate;
            }
            if (dueToDate) {
                where.dueDate.lte = dueToDate;
            }
        }
        return where;
    }
    buildTaskListOrderBy(query) {
        const sortBy = query.sortBy ?? list_tasks_query_dto_1.TaskSortBy.CREATED_AT;
        const sortOrder = query.sortOrder === list_tasks_query_dto_1.SortOrder.ASC ? 'asc' : 'desc';
        const orderBy = [
            { [sortBy]: sortOrder },
        ];
        if (sortBy !== list_tasks_query_dto_1.TaskSortBy.CREATED_AT) {
            orderBy.push({ createdAt: 'desc' });
        }
        return orderBy;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService,
        users_service_1.UsersService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map