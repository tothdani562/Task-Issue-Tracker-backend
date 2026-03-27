import { TaskPriority, TaskStatus } from '@prisma/client';
export declare enum TaskSortBy {
    CREATED_AT = "createdAt",
    DUE_DATE = "dueDate",
    PRIORITY = "priority",
    STATUS = "status"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class ListTasksQueryDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueFrom?: string;
    dueTo?: string;
    sortBy?: TaskSortBy;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
