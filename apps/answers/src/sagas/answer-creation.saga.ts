import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, merge } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { RequestAnswerValidationCommand } from '../commands/impl/request-answer-validation.command';
import { ApproveAnswerCommand } from '../commands/impl/approve-answer.command';
import { DeleteAnswerCommand } from '../commands/impl/delete-answer.command';
import { AnswerSagaState } from '../entities/answer-saga-state.entity';
import { AnswerSagaStatus } from '../entities/answer-saga-status.enum';
import { AnswerCreatedEvent } from '../events/impl/answer-created.event';
import { AnswerApprovedExternalEvent } from '../events/impl/answer-approved-external.event';
import { AnswerRejectedExternalEvent } from '../events/impl/answer-rejected-external.event';

@Injectable()
export class AnswerCreationSaga {
  constructor(
    @InjectRepository(AnswerSagaState)
    private readonly sagaStateRepo: Repository<AnswerSagaState>,
  ) {}

  @Saga()
  answerLifecycle = (events$: Observable<unknown>): Observable<ICommand> => {
    const onCreated$ = events$.pipe(
      ofType(AnswerCreatedEvent),
      mergeMap(async (event): Promise<ICommand | null> => {
        const existing = await this.sagaStateRepo.findOneBy({
          answerId: event.id,
        });

        if (existing) {
          return null;
        }

        await this.sagaStateRepo.save({
          answerId: event.id,
          questionId: event.questionId,
          status: AnswerSagaStatus.PendingValidation,
          resolvedAt: null,
        });

        return new RequestAnswerValidationCommand(event.id, event.questionId);
      }),
      filter((command): command is ICommand => command !== null),
    );

    const onApproved$ = events$.pipe(
      ofType(AnswerApprovedExternalEvent),
      mergeMap(async (event): Promise<ICommand | null> => {
        const state = await this.sagaStateRepo.findOneBy({
          answerId: event.answerId,
        });

        if (!state || state.status !== AnswerSagaStatus.PendingValidation) {
          return null;
        }

        await this.sagaStateRepo.update(event.answerId, {
          status: AnswerSagaStatus.Approved,
          resolvedAt: new Date(),
        });

        return new ApproveAnswerCommand(event.answerId);
      }),
      filter((command): command is ICommand => command !== null),
    );

    const onRejected$ = events$.pipe(
      ofType(AnswerRejectedExternalEvent),
      mergeMap(async (event): Promise<ICommand | null> => {
        const state = await this.sagaStateRepo.findOneBy({
          answerId: event.answerId,
        });

        if (!state || state.status !== AnswerSagaStatus.PendingValidation) {
          return null;
        }

        await this.sagaStateRepo.update(event.answerId, {
          status: AnswerSagaStatus.Rejected,
          resolvedAt: new Date(),
        });

        return new DeleteAnswerCommand(event.answerId);
      }),
      filter((command): command is ICommand => command !== null),
    );

    return merge(onCreated$, onApproved$, onRejected$);
  };
}
