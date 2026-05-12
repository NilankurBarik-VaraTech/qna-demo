import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerApprovedEvent } from '../impl/answer-approved.event';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@EventsHandler(AnswerApprovedEvent)
export class AnswerApprovedProjection implements IEventHandler<AnswerApprovedEvent> {
  constructor(
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async handle(event: AnswerApprovedEvent): Promise<void> {
    await this.answerReadRepo.update(event.answerId, {
      status: event.status,
    });

    console.log(
      `[AnswerApprovedProjection] Marked answer ${event.answerId} as approved in read model`,
    );
  }
}
