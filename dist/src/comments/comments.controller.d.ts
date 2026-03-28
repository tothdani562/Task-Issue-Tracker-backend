import type { AuthUser } from '../auth/types/auth-user.type';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(taskId: string, user: AuthUser, dto: CreateCommentDto): Promise<{
        author: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        taskId: string;
        authorId: string;
    }>;
    findAllForTask(taskId: string, user: AuthUser, query: ListCommentsQueryDto): Promise<{
        data: ({
            author: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            taskId: string;
            authorId: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            hasNext: boolean;
        };
    }>;
    findOne(commentId: string, user: AuthUser): Promise<{
        task: {
            projectId: string;
        };
        author: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        taskId: string;
        authorId: string;
    }>;
    update(commentId: string, user: AuthUser, dto: UpdateCommentDto): Promise<{
        author: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        taskId: string;
        authorId: string;
    }>;
    remove(commentId: string, user: AuthUser): Promise<void>;
}
