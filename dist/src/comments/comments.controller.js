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
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const comments_service_1 = require("./comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const list_comments_query_dto_1 = require("./dto/list-comments-query.dto");
const update_comment_dto_1 = require("./dto/update-comment.dto");
let CommentsController = class CommentsController {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async create(taskId, user, dto) {
        return this.commentsService.create(taskId, user.userId, dto);
    }
    async findAllForTask(taskId, user, query) {
        return this.commentsService.findAllForTask(taskId, user.userId, query);
    }
    async findOne(commentId, user) {
        return this.commentsService.findOne(commentId, user.userId);
    }
    async update(commentId, user, dto) {
        return this.commentsService.update(commentId, user.userId, dto);
    }
    async remove(commentId, user) {
        await this.commentsService.remove(commentId, user.userId);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)('tasks/:taskId/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create comment on a task' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Comment created successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project membership for this task' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'List comments for task with pagination' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (>=1)' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Page size (1-100)',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Comments list returned' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project membership for this task' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, list_comments_query_dto_1.ListCommentsQueryDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findAllForTask", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/comments/:commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single comment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Comment returned' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'No project membership for this task' }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/comments/:commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update comment (author or project owner)' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Comment updated successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Insufficient permission to update comment',
    }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_comment_dto_1.UpdateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId/comments/:commentId'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiOperation)({ summary: 'Delete comment (author or project owner)' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'Task UUID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment UUID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Comment deleted successfully' }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Insufficient permission to delete comment',
    }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "remove", null);
exports.CommentsController = CommentsController = __decorate([
    (0, swagger_1.ApiTags)('comments'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map