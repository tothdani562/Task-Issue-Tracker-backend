import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { UsersService } from './users.service';

@Module({
  imports: [CommonModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
