import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Inject,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('/questions')
export class ApiGatewayController {
  constructor(
    @Inject('QUESTIONS_SERVICE')
    private clientQuest: ClientProxy,
    @Inject('ANSWERS_SERVICE')
    private clientAnsw: ClientProxy,
  ) {}

  @Post()
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.clientQuest.emit('question_created', createQuestionDto);
  }

  @Get()
  async getQuestions(@Query() paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 3;

    return this.clientQuest.send({ cmd: 'get-all-questions' }, { page, limit });
  }

  @Delete('/:questionId')
  async deleteQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.clientQuest.emit('question_delete', { id: questionId });
  }

  @Post('/:questionId/answers')
  async createAnswer(
    @Body() createAnswer: CreateAnswerDto,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.clientAnsw.emit('answer_created', {
      questionId,
      content: createAnswer.content,
    });
  }

  @Get('/:questionId/answers')
  async getAnswers(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 2;

    return this.clientAnsw.send(
      { cmd: 'get-all-answers' },
      { id: questionId, page, limit },
    );
  }
}
