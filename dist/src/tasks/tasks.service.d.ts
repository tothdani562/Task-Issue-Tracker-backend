import { PrismaService } from '../common/prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private readonly prisma;
    private readonly projectsService;
    private readonly usersService;
    constructor(prisma: PrismaService, projectsService: ProjectsService, usersService: UsersService);
    create(projectId: string, userId: string, dto: CreateTaskDto): Promise<{
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
    }>;
    findAllForProject(projectId: string, userId: string, query: ListTasksQueryDto): Promise<{
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
    }>;
    findOneForProject(projectId: string, taskId: string, userId: string): Promise<{
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
    }>;
    updateForProject(projectId: string, taskId: string, userId: string, dto: UpdateTaskDto): Promise<{
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
    }>;
    removeForProject(projectId: string, taskId: string, userId: string): Promise<void>;
    private getTaskForProjectOrThrow;
    private assertAssigneeIsProjectMember;
    private buildTaskListWhere;
    private buildTaskListOrderBy;
}
