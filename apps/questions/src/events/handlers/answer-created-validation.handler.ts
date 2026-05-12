import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AnswerCreatedExternalEvent } from '../impl/answer-created-external.event';
import { CheckQuestionExistsQuery } from '../../queries/impl/check-question-exists.query';

@EventsHandler(AnswerCreatedExternalEvent)
export class AnswerCreatedValidationHandler implements IEventHandler<AnswerCreatedExternalEvent> {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  async handle(event: AnswerCreatedExternalEvent): Promise<void> {
    console.log(
      `[AnswerCreatedValidationHandler] Validating answer ${event.answerId} for question ${event.questionId}`,
    );

    const exists = await this.queryBus.execute<
      CheckQuestionExistsQuery,
      boolean
    >(new CheckQuestionExistsQuery(event.questionId));

    if (exists) {
      await firstValueFrom(
        this.rabbitClient.emit('answer_approved', {
          answerId: event.answerId,
          questionId: event.questionId,
        }),
      );

      console.log(
        `[AnswerCreatedValidationHandler] Answer ${event.answerId} approved for question ${event.questionId}`,
      );
      return;
    }

    const reason = `Question with ID ${event.questionId} does not exist`;

    await firstValueFrom(
      this.rabbitClient.emit('answer_rejected', {
        answerId: event.answerId,
        questionId: event.questionId,
        reason,
      }),
    );

    console.log(
      `[AnswerCreatedValidationHandler] Answer ${event.answerId} rejected: ${reason}`,
    );
  }
}
