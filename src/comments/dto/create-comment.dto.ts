import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment content must not be empty' })
  @MaxLength(5000, {
    message: 'Comment content must not exceed 5000 characters',
  })
  content: string;
}
