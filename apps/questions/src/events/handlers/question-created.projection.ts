import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionCreatedEvent } from '../impl/question-created.event';
import { QuestionReadModel } from '../../entities/question-read.entity';

@EventsHandler(QuestionCreatedEvent)
export class QuestionCreatedProjection implements IEventHandler<QuestionCreatedEvent> {
  constructor(
    @InjectRepository(QuestionReadModel, 'read')
    private questionReadRepo: Repository<QuestionReadModel>,
  ) {}

  async handle(event: QuestionCreatedEvent) {
    console.log(
      `[QuestionCreatedProjection] Projecting question ${event.id} to read database`,
    );

    const readModel = this.questionReadRepo.create({
      id: event.id,
      title: event.title,
      description: event.description,
      // answerCount: 0,
    });

    await this.questionReadRepo.save(readModel);

    console.log(
      `[QuestionCreatedProjection] Question ${event.id} projected to read database`,
    );
  }
}
