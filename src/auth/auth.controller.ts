import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './types/auth-user.type';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({ description: 'User registered and tokens issued' })
  @ApiTooManyRequestsResponse({
    description: 'Too many registration attempts',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiCreatedResponse({ description: 'Login successful, tokens issued' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Issue new tokens from a refresh token' })
  @ApiCreatedResponse({ description: 'New tokens issued' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @ApiTooManyRequestsResponse({
    description: 'Too many refresh attempts',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Logout current user and revoke refresh token hash',
  })
  @ApiCreatedResponse({ description: 'Logout successful' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Return currently authenticated user payload' })
  @ApiOkResponse({ description: 'Authenticated user payload returned' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }
}
