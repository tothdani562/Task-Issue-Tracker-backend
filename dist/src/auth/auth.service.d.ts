import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
    };
};
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponse>;
    logout(userId: string): Promise<{
        success: true;
    }>;
    private issueTokens;
    private signAccessToken;
    private signRefreshToken;
    private verifyRefreshToken;
}
export {};
