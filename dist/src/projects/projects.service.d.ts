import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private readonly prisma;
    private readonly usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    create(userId: string, dto: CreateProjectDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    findAllForUser(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }[]>;
    findOneForUser(projectId: string, userId: string): Promise<({
        members: {
            createdAt: Date;
            role: import("@prisma/client").$Enums.ProjectMemberRole;
            userId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }) | null>;
    update(projectId: string, userId: string, dto: UpdateProjectDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        ownerId: string;
    }>;
    remove(projectId: string, userId: string): Promise<void>;
    addMember(projectId: string, userId: string, dto: AddProjectMemberDto): Promise<{
        id: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.ProjectMemberRole;
        projectId: string;
        userId: string;
    }>;
    removeMember(projectId: string, userId: string, memberUserId: string): Promise<void>;
    assertProjectAccess(projectId: string, userId: string): Promise<void>;
    assertProjectOwner(projectId: string, userId: string): Promise<void>;
}
