import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AnswerSubmittedExternalEvent } from '../impl/answer-submitted-external.event';
import { CheckQuestionExistsQuery } from '../../queries/impl/check-question-exists.query';

@EventsHandler(AnswerSubmittedExternalEvent)
export class AnswerSubmittedValidationHandler implements IEventHandler<AnswerSubmittedExternalEvent> {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  async handle(event: AnswerSubmittedExternalEvent): Promise<void> {
    console.log(
      `[AnswerSubmittedValidationHandler] Validating answer ${event.answerId} for question ${event.questionId}`,
    );

    const exists = await this.queryBus.execute<
      CheckQuestionExistsQuery,
      boolean
    >(new CheckQuestionExistsQuery(event.questionId));

    if (exists) {
      console.log(
        `[AnswerSubmittedValidationHandler] Answer ${event.answerId} accepted for question ${event.questionId}`,
      );
      return;
    }

    const reason = `Question with ID ${event.questionId} does not exist`;

    console.log(
      `[AnswerSubmittedValidationHandler] Answer ${event.answerId} rejected: ${reason}`,
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
