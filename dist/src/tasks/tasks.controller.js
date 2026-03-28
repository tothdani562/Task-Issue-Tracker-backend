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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_task_dto_1 = require("./dto/create-task.dto");
const list_tasks_query_dto_1 = require("./dto/list-tasks-query.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const tasks_service_1 = require("./tasks.service");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    ok(data) {
        return { success: true, data };
    }
    async create(user, projectId, dto) {
        const task = await this.tasksService.create(projectId, user.userId, dto);
        return this.ok(task);
    }
    async findAll(user, projectId, query) {
        const result = await this.tasksService.findAllForProject(projectId, user.userId, query);
        return this.ok(result);
    }
    async findOne(user, projectId, taskId) {
        const task = await this.tasksService.findOneForProject(projectId, taskId, user.userId);
        return this.ok(task);
    }
    async update(user, projectId, taskId, dto) {
        const task = await this.tasksService.updateForProject(projectId, taskId, user.userId, dto);
        return this.ok(task);
    }
    async remove(user, projectId, taskId) {
        await this.tasksService.removeForProject(projectId, taskId, user.userId);
        return this.ok({ deleted: true });
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create task in a project' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Task created successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project access' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List tasks in project with filtering and pagination',
    }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Task status' }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, description: 'Task priority' }),
    (0, swagger_1.ApiQuery)({
        name: 'assigneeId',
        required: false,
        description: 'Assignee user UUID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'dueFrom',
        required: false,
        description: 'Lower due-date bound (ISO date)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'dueTo',
        required: false,
        description: 'Upper due-date bound (ISO date)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort field' }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        required: false,
        description: 'Sort direction (asc or desc)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (>=1)' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Page size (1-100)',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Paginated task list returned' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project access' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, list_tasks_query_dto_1.ListTasksQueryDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one task in project' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Task returned' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project access' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('taskId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update task in project' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Task updated successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project access' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('taskId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete task in project' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Task deleted successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project access' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('taskId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects/:projectId/tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map