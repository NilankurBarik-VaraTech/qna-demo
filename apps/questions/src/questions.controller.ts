import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateQuestionCommand } from './commands/impl/create-question.command';
import { DeleteQuestionCommand } from './commands/impl/delete-question.command';
import { UpdateQuestionCommand } from './commands/impl/update-question.command';
import { GetAllQuestionsQuery } from './queries/impl/get-all-questions.query';
import { GetQuestionByIdQuery } from './queries/impl/get-question-by-id.query';
import { AnswerCreatedExternalEvent } from './events/impl/answer-created-external.event';

@Controller()
export class QuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @EventPattern('question_created')
  async createQuestions(question: CreateQuestionDto) {
    return this.commandBus.execute(
      new CreateQuestionCommand(question.title, question.description),
    );
  }

  @MessagePattern({ cmd: 'get-all-questions' })
  async getAllQuestions(data: { page: number; limit: number }) {
    return this.queryBus.execute(
      new GetAllQuestionsQuery(data.page, data.limit),
    );
  }

  @MessagePattern({ cmd: 'get-question-by-id' })
  async getQuestionById(data: { id: number }) {
    return this.queryBus.execute(new GetQuestionByIdQuery(data.id));
  }

  @EventPattern('question_update')
  async updateQuestion(payload: { id: number } & UpdateQuestionDto) {
    return this.commandBus.execute(
      new UpdateQuestionCommand(payload.id, payload.title, payload.description),
    );
  }

  @EventPattern('question_delete')
  async deleteQuestion(payload: { id: number }) {
    return this.commandBus.execute(new DeleteQuestionCommand(payload.id));
  }

  @EventPattern('answer_created')
  handleAnswerCreated(payload: { answerId: number; questionId: number }): void {
    console.log(
      `[QuestionsController] Received answer_created for answer ${payload.answerId}`,
    );
    this.eventBus.publish(
      new AnswerCreatedExternalEvent(payload.answerId, payload.questionId),
    );
  }
}
