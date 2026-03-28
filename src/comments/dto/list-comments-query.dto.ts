import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class ListCommentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Page must be a positive integer' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Limit must be a positive integer' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit: number = 20;
}
