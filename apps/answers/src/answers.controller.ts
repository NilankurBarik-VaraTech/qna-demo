import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { QueryBus, EventBus } from '@nestjs/cqrs';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GetAllAnswersQuery } from './queries/impl/get-all-answers.query';
import { QuestionDeletedExternalEvent } from './events/impl/question-deleted-external.event';
import { AnswerCreationRequestedEvent } from './events/impl/answer-creation-requested.event';
import { AnswerRejectedEvent } from './events/impl/answer-rejected.event';

type CreateAnswerMessage = CreateAnswerDto & {
  questionId: number;
};

@Controller()
export class AnswersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @EventPattern('answer_created')
  async createAnswer(answer: CreateAnswerMessage) {
    this.eventBus.publish(
      new AnswerCreationRequestedEvent(answer.questionId, answer.content),
    );
  }

  @MessagePattern({ cmd: 'get-all-answers' })
  async getAllAnswers(payload: { id: number; page: number; limit: number }) {
    const { id, page, limit } = payload;
    return this.queryBus.execute(new GetAllAnswersQuery(id, page, limit));
  }

  @EventPattern('question_deleted')
  async handleQuestionDeleted(payload: { questionId: number }) {
    console.log(
      `[AnswersController] Received question_deleted event for question ${payload.questionId}`,
    );
    this.eventBus.publish(new QuestionDeletedExternalEvent(payload.questionId));
  }

  @EventPattern('answer_rejected')
  async handleAnswerRejected(payload: {
    answerId: number;
    questionId: number;
    reason: string;
  }) {
    this.eventBus.publish(
      new AnswerRejectedEvent(
        payload.answerId,
        payload.questionId,
        payload.reason,
      ),
    );
  }
}
