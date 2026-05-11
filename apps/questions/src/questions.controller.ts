import { Controller, Inject } from '@nestjs/common';
import { EventPattern, MessagePattern, ClientProxy } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionCommand } from './commands/impl/create-question.command';
import { DeleteQuestionCommand } from './commands/impl/delete-question.command';
import { GetAllQuestionsQuery } from './queries/impl/get-all-questions.query';
import { CheckQuestionExistsQuery } from './queries/impl/check-question-exists.query';

@Controller()
export class QuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
  async validateSubmittedAnswer(payload: {
    answerId: number;
    questionId: number;
  }) {
    const exists = await this.queryBus.execute(
      new CheckQuestionExistsQuery(payload.questionId),
    );

    if (exists) {
      console.log(
        `[QuestionsController] Answer ${payload.answerId} accepted for question ${payload.questionId}`,
      );
      return;
    }

    const reason = `Question with ID ${payload.questionId} does not exist`;

    console.log(
      `[QuestionsController] Answer ${payload.answerId} rejected: ${reason}`,
    );

    this.rabbitClient.emit('answer_rejected', {
      answerId: payload.answerId,
      questionId: payload.questionId,
      reason,
    });
  }
}
