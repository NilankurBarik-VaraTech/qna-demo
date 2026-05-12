import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;
}
