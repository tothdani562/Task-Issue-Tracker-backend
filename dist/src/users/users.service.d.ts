import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<User>;
}
