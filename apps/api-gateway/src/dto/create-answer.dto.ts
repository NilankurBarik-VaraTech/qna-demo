import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
