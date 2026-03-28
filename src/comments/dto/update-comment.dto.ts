import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Comment content must not be empty' })
  @MaxLength(5000, {
    message: 'Comment content must not exceed 5000 characters',
  })
  content?: string;
}
