import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionDeletedEvent } from '../impl/question-deleted.event';
import { QuestionReadModel } from '../../entities/question-read.entity';

@EventsHandler(QuestionDeletedEvent)
export class QuestionDeletedProjection implements IEventHandler<QuestionDeletedEvent> {
  constructor(
    @InjectRepository(QuestionReadModel, 'read')
    private questionReadRepo: Repository<QuestionReadModel>,
  ) {}

  async handle(event: QuestionDeletedEvent) {
    console.log(
      `[QuestionDeletedProjection] Removing question ${event.questionId} from read database`,
    );

    await this.questionReadRepo.delete({ id: event.questionId });

    console.log(
      `[QuestionDeletedProjection] Question ${event.questionId} removed from read database`,
    );
  }
}
