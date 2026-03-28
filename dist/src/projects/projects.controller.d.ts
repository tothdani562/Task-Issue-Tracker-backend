import type { AuthUser } from '../auth/types/auth-user.type';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
type ApiSuccessResponse<T> = {
    success: true;
    data: T;
};
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    private ok;
    create(user: AuthUser, dto: CreateProjectDto): Promise<ApiSuccessResponse<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>>;
    findAll(user: AuthUser): Promise<ApiSuccessResponse<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }[]>>;
    findOne(user: AuthUser, id: string): Promise<ApiSuccessResponse<({
        members: {
            createdAt: Date;
            role: import("@prisma/client").$Enums.ProjectMemberRole;
            userId: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }) | null>>;
    update(user: AuthUser, id: string, dto: UpdateProjectDto): Promise<ApiSuccessResponse<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>>;
    remove(user: AuthUser, id: string): Promise<ApiSuccessResponse<{
        deleted: boolean;
    }>>;
    addMember(user: AuthUser, id: string, dto: AddProjectMemberDto): Promise<ApiSuccessResponse<{
        id: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.ProjectMemberRole;
        projectId: string;
        userId: string;
    }>>;
    removeMember(user: AuthUser, id: string, memberUserId: string): Promise<ApiSuccessResponse<{
        removed: boolean;
        memberUserId: string;
    }>>;
}
export {};
