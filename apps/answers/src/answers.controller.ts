import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { QueryBus, EventBus, CommandBus } from '@nestjs/cqrs';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GetAllAnswersQuery } from './queries/impl/get-all-answers.query';
import { AnswerRejectedExternalEvent } from './events/impl/answer-rejected-external.event';
import { QuestionDeletedExternalEvent } from './events/impl/question-deleted-external.event';
import { CreateAnswerCommand } from './commands/impl/create-answer.command';
import { Answer } from './entities/answer.entity';

type CreateAnswerMessage = CreateAnswerDto & {
  questionId: number;
};

@Controller()
export class AnswersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  @EventPattern('answer_created')
  async createAnswer(answer: CreateAnswerMessage): Promise<Answer> {
    return this.commandBus.execute(
      new CreateAnswerCommand(answer.questionId, answer.content),
    );
  }

  @MessagePattern({ cmd: 'get-all-answers' })
  async getAllAnswers(payload: {
    id: number;
    page: number;
    limit: number;
  }): Promise<unknown> {
    const { id, page, limit } = payload;
    return this.queryBus.execute(new GetAllAnswersQuery(id, page, limit));
  }

  @EventPattern('question_deleted')
  handleQuestionDeleted(payload: { questionId: number }): void {
    console.log(
      `[AnswersController] Received question_deleted event for question ${payload.questionId}`,
    );
    this.eventBus.publish(new QuestionDeletedExternalEvent(payload.questionId));
  }

  @EventPattern('answer_rejected')
  handleAnswerRejected(payload: {
    answerId: number;
    questionId: number;
    reason: string;
  }): void {
    console.log(
      `[AnswersController] Answer ${payload.answerId} rejected: ${payload.reason}`,
    );
    this.eventBus.publish(
      new AnswerRejectedExternalEvent(
        payload.answerId,
        payload.questionId,
        payload.reason,
      ),
    );
  }
}
