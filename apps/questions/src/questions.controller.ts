import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionCommand } from './commands/impl/create-question.command';
import { DeleteQuestionCommand } from './commands/impl/delete-question.command';
import { GetAllQuestionsQuery } from './queries/impl/get-all-questions.query';
import { AnswerSubmittedEvent } from './events/impl/answer-submitted.event';

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

  @EventPattern('question_delete')
  async deleteQuestion(payload: { id: number }) {
    return this.commandBus.execute(new DeleteQuestionCommand(payload.id));
  }

  @EventPattern('answer_submitted')
  async validateSubmittedAnswer(payload: {
    answerId: number;
    questionId: number;
  }) {
    this.eventBus.publish(
      new AnswerSubmittedEvent(payload.answerId, payload.questionId),
    );
  }
}
