import { Inject, Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { EMPTY, firstValueFrom, Observable } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { AnswerCreatedEvent } from '../events/impl/answer-created.event';

@Injectable()
export class AnswerSaga {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

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
        ).catch((error: Error) => {
          console.log(
            `[AnswerSaga] Failed to publish answer ${event.id} for validation: ${error.message}`,
          );
        });

        return EMPTY;
      }),
    );
  };
}
