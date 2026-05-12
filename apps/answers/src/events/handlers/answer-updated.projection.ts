import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerUpdatedEvent } from '../impl/answer-updated.event';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@EventsHandler(AnswerUpdatedEvent)
export class AnswerUpdatedProjection implements IEventHandler<AnswerUpdatedEvent> {
  constructor(
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async handle(event: AnswerUpdatedEvent) {
    const { id, content } = event;

    await this.answerReadRepo.update(id, { content });

    console.log(`[AnswerUpdatedProjection] Updated answer ${id} in read model`);
  }
}
