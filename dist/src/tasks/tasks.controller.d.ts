import type { AuthUser } from '../auth/types/auth-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
type ApiSuccessResponse<T> = {
    success: true;
    data: T;
};
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    private ok;
    create(user: AuthUser, projectId: string, dto: CreateTaskDto): Promise<ApiSuccessResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedUserId: string | null;
    }>>;
    findAll(user: AuthUser, projectId: string, query: ListTasksQueryDto): Promise<ApiSuccessResponse<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            projectId: string;
            title: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            priority: import("@prisma/client").$Enums.TaskPriority;
            dueDate: Date | null;
            assignedUserId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            hasNext: boolean;
        };
    }>>;
    findOne(user: AuthUser, projectId: string, taskId: string): Promise<ApiSuccessResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedUserId: string | null;
    }>>;
    update(user: AuthUser, projectId: string, taskId: string, dto: UpdateTaskDto): Promise<ApiSuccessResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedUserId: string | null;
    }>>;
    remove(user: AuthUser, projectId: string, taskId: string): Promise<ApiSuccessResponse<{
        deleted: boolean;
    }>>;
}
export {};
