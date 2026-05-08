import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CheckQuestionExistsQuery } from '../../queries/impl/check-question-exists.query';
import { AnswerSubmittedEvent } from '../impl/answer-submitted.event';

@EventsHandler(AnswerSubmittedEvent)
export class AnswerSubmittedHandler implements IEventHandler<AnswerSubmittedEvent> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async handle(event: AnswerSubmittedEvent) {
    const exists = await this.queryBus.execute(
      new CheckQuestionExistsQuery(event.questionId),
    );

    if (exists) {
      console.log(
        `[AnswerSubmittedHandler] Answer ${event.answerId} accepted for question ${event.questionId}`,
      );
      return;
    }

    const reason = `Question with ID ${event.questionId} does not exist`;

    console.log(
      `[AnswerSubmittedHandler] Answer ${event.answerId} rejected: ${reason}`,
    );

    await firstValueFrom(
      this.rabbitClient.emit('answer_rejected', {
        answerId: event.answerId,
        questionId: event.questionId,
        reason,
      }),
    );
  }
}
