import { Inject, Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga, QueryBus } from '@nestjs/cqrs';
import { Observable, EMPTY, firstValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ClientProxy } from '@nestjs/microservices';
import { AnswerSubmittedExternalEvent } from '../events/impl/answer-submitted-external.event';
import { QuestionDeletedEvent } from '../events/impl/question-deleted.event';
import { CheckQuestionExistsQuery } from '../queries/impl/check-question-exists.query';

@Injectable()
export class QuestionSaga {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
    private readonly queryBus: QueryBus,
  ) {}

  @Saga()
  answerSubmittedValidation = (
    events$: Observable<any>,
  ): Observable<ICommand> => {
    return events$.pipe(
      ofType(AnswerSubmittedExternalEvent),
      mergeMap(async (event) => {
        console.log(
          `[QuestionSaga] Validating answer ${event.answerId} for question ${event.questionId}`,
        );

        const exists = await this.queryBus.execute(
          new CheckQuestionExistsQuery(event.questionId),
        );

        if (exists) {
          console.log(
            `[QuestionSaga] Answer ${event.answerId} accepted for question ${event.questionId}`,
          );
          return EMPTY;
        }

        const reason = `Question with ID ${event.questionId} does not exist`;

        console.log(
          `[QuestionSaga] Answer ${event.answerId} rejected: ${reason}`,
        );

        await firstValueFrom(
          this.rabbitClient.emit('answer_rejected', {
            answerId: event.answerId,
            questionId: event.questionId,
            reason,
          }),
        );

        return EMPTY;
      }),
      mergeMap((result) => result),
    );
  };

  @Saga()
  questionDeletedCascade = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(QuestionDeletedEvent),
      mergeMap((event) => {
        console.log(
          `[QuestionSaga] Publishing question ${event.questionId} deletion for answer cascade`,
        );

        void firstValueFrom(
          this.rabbitClient.emit('question_deleted', {
            questionId: event.questionId,
          }),
        ).catch((error: Error) => {
          console.log(
            `[QuestionSaga] Failed to publish question ${event.questionId} deletion: ${error.message}`,
          );
        });

        return EMPTY;
      }),
    );
  };
}
