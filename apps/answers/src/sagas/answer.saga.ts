import { Inject, Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { EMPTY, firstValueFrom, Observable } from 'rxjs';
import { delay, map, mergeMap } from 'rxjs/operators';
import { AnswerCreatedEvent } from '../events/impl/answer-created.event';
import { AnswerRejectedExternalEvent } from '../events/impl/answer-rejected-external.event';
import { QuestionDeletedExternalEvent } from '../events/impl/question-deleted-external.event';
import { DeleteAnswerCommand } from '../commands/impl/delete-answer.command';
import { DeleteAnswersByQuestionCommand } from '../commands/impl/delete-answers-by-question.command';

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

  @Saga()
  answerRejectedCleanup = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(AnswerRejectedExternalEvent),
      map((event) => {
        console.log(
          `[AnswerSaga] Answer ${event.answerId} rejected by questions service: ${event.reason}`,
        );
        return new DeleteAnswerCommand(event.answerId);
      }),
    );
  };

  @Saga()
  questionDeletedCascade = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(QuestionDeletedExternalEvent),
      map((event) => {
        console.log(
          `[AnswerSaga] Question ${event.questionId} deleted, cascading to delete answers`,
        );
        return new DeleteAnswersByQuestionCommand(event.questionId);
      }),
    );
  };
}
