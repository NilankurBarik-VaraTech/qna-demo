import { Inject, Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { EMPTY, firstValueFrom, Observable } from 'rxjs';
import { delay, map, mergeMap } from 'rxjs/operators';
import { CreateAnswerCommand } from '../commands/impl/create-answer.command';
import { DeleteAnswerCommand } from '../commands/impl/delete-answer.command';
import { AnswerCreationRequestedEvent } from '../events/impl/answer-creation-requested.event';
import { AnswerCreatedEvent } from '../events/impl/answer-created.event';
import { AnswerRejectedEvent } from '../events/impl/answer-rejected.event';

@Injectable()
export class AnswerSaga {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  @Saga()
  answerCreationRequested = (
    events$: Observable<any>,
  ): Observable<ICommand> => {
    return events$.pipe(
      ofType(AnswerCreationRequestedEvent),
      map((event) => new CreateAnswerCommand(event.questionId, event.content)),
    );
  };

  @Saga()
  answerCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(AnswerCreatedEvent),
      delay(100),
      mergeMap((event) => {
        console.log(
          `[AnswerSaga] Publishing answer ${event.id} for async question validation`,
        );

        void firstValueFrom(
          this.rabbitClient.emit('answer_submitted', {
            answerId: event.id,
            questionId: event.questionId,
          }),
        ).catch((error) => {
          console.log(
            `[AnswerSaga] Failed to publish answer ${event.id} for validation: ${error.message}`,
          );
        });

        return EMPTY;
      }),
    );
  };

  @Saga()
  answerRejected = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(AnswerRejectedEvent),
      map((event) => {
        console.log(
          `[AnswerSaga] Answer ${event.answerId} rejected for question ${event.questionId}; compensating delete: ${event.reason}`,
        );
        return new DeleteAnswerCommand(event.answerId);
      }),
    );
  };
}
