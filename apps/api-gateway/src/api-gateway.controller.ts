import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Inject,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
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

  @Get('/:questionId')
  async getQuestionById(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.clientQuest.send({ cmd: 'get-question-by-id' }, { id: questionId });
  }

  @Put('/:questionId')
  async updateQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.clientQuest.emit('question_update', {
      id: questionId,
      ...updateQuestionDto,
    });
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

  @Get('/:questionId/answers/:answerId')
  async getAnswerById(@Param('answerId', ParseIntPipe) answerId: number) {
    return this.clientAnsw.send({ cmd: 'get-answer-by-id' }, { id: answerId });
  }

  @Put('/:questionId/answers/:answerId')
  async updateAnswer(
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    return this.clientAnsw.emit('answer_update', {
      id: answerId,
      ...updateAnswerDto,
    });
  }

  @Delete('/:questionId/answers/:answerId')
  async deleteAnswer(@Param('answerId', ParseIntPipe) answerId: number) {
    return this.clientAnsw.emit('answer_delete', { id: answerId });
  }
}
