import { PrismaService } from '../common/prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
export declare class CommentsService {
    private readonly prisma;
    private readonly projectsService;
    constructor(prisma: PrismaService, projectsService: ProjectsService);
    create(taskId: string, userId: string, dto: CreateCommentDto): Promise<{
        author: {
            id: string;
            email: string;
        };
    } & {
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        authorId: string;
    }>;
    findAllForTask(taskId: string, userId: string, query: ListCommentsQueryDto): Promise<{
        data: ({
            author: {
                id: string;
                email: string;
            };
        } & {
            content: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
    findOne(id: string, userId: string): Promise<{
        task: {
            projectId: string;
        };
        author: {
            id: string;
            email: string;
        };
    } & {
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        authorId: string;
    }>;
    update(id: string, userId: string, dto: UpdateCommentDto): Promise<{
        author: {
            id: string;
            email: string;
        };
    } & {
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        authorId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        author: {
            id: string;
            email: string;
        };
    } & {
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        authorId: string;
    }>;
    private findTaskWithProject;
    private findCommentWithTask;
    private assertUserIsProjectMember;
    private assertUserCanModifyComment;
}
