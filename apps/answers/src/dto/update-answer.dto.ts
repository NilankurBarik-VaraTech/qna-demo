import { IsString, MinLength } from 'class-validator';

export class UpdateAnswerDto {
  @IsString()
  @MinLength(1)
  content: string;
}
