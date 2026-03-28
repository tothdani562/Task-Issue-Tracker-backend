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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const add_project_member_dto_1 = require("./dto/add-project-member.dto");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const projects_service_1 = require("./projects.service");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    ok(data) {
        return { success: true, data };
    }
    async create(user, dto) {
        const project = await this.projectsService.create(user.userId, dto);
        return this.ok(project);
    }
    async findAll(user) {
        const projects = await this.projectsService.findAllForUser(user.userId);
        return this.ok(projects);
    }
    async findOne(user, id) {
        const project = await this.projectsService.findOneForUser(id, user.userId);
        return this.ok(project);
    }
    async update(user, id, dto) {
        const project = await this.projectsService.update(id, user.userId, dto);
        return this.ok(project);
    }
    async remove(user, id) {
        await this.projectsService.remove(id, user.userId);
        return this.ok({ deleted: true });
    }
    async addMember(user, id, dto) {
        const member = await this.projectsService.addMember(id, user.userId, dto);
        return this.ok(member);
    }
    async removeMember(user, id, memberUserId) {
        await this.projectsService.removeMember(id, user.userId, memberUserId);
        return this.ok({ removed: true, memberUserId });
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Project created successfully' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List projects where current user is owner or member',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Projects list returned' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one project by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Project UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Project returned' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No access to this project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update project details (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Project UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Project updated successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Only project owner can update' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Project UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Project deleted successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Only project owner can delete' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Add member to project (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Project UUID' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Member added to project' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Only project owner can add member' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_project_member_dto_1.AddProjectMemberDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberUserId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from project (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Project UUID' }),
    (0, swagger_1.ApiParam)({ name: 'memberUserId', description: 'Member user UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Member removed from project' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Only project owner can remove member' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('memberUserId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "removeMember", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('projects'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map