import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { QuestionCreatedEvent } from '../events/impl/question-created.event';

@Injectable()
export class QuestionSaga {
  @Saga()
  questionCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(QuestionCreatedEvent),
      mergeMap((event) => {
        console.log(`[QuestionSaga] Question created: ${event.id}`);
        // Can trigger additional commands here if needed
        return EMPTY;
      }),
    );
  };
}
