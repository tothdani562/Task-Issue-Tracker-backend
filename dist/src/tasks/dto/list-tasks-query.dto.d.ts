import { TaskPriority, TaskStatus } from '@prisma/client';
export declare class ListTasksQueryDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    page?: number;
    limit?: number;
}
