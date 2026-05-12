import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionUpdatedEvent } from '../impl/question-updated.event';
import { QuestionReadModel } from '../../entities/question-read.entity';

@EventsHandler(QuestionUpdatedEvent)
export class QuestionUpdatedProjection implements IEventHandler<QuestionUpdatedEvent> {
  constructor(
    @InjectRepository(QuestionReadModel, 'read')
    private questionReadRepo: Repository<QuestionReadModel>,
  ) {}

  async handle(event: QuestionUpdatedEvent) {
    const { id, title, description } = event;

    await this.questionReadRepo.update(id, { title, description });

    console.log(
      `[QuestionUpdatedProjection] Updated question ${id} in read model`,
    );
  }
}
