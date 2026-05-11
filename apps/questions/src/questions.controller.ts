import { Controller, Inject } from '@nestjs/common';
import { EventPattern, MessagePattern, ClientProxy } from '@nestjs/microservices';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionCommand } from './commands/impl/create-question.command';
import { DeleteQuestionCommand } from './commands/impl/delete-question.command';
import { GetAllQuestionsQuery } from './queries/impl/get-all-questions.query';
import { AnswerSubmittedExternalEvent } from './events/impl/answer-submitted-external.event';

@Controller()
export class QuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
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
  handleAnswerSubmitted(payload: {
    answerId: number;
    questionId: number;
  }): void {
    console.log(
      `[QuestionsController] Received answer_submitted for answer ${payload.answerId}`,
    );
    // Publish to event bus - saga will handle validation
    this.eventBus.publish(
      new AnswerSubmittedExternalEvent(payload.answerId, payload.questionId),
    );
  }
}
