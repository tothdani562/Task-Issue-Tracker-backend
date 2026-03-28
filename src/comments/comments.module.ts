import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommonModule } from '../common/common.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [CommonModule, ProjectsModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
