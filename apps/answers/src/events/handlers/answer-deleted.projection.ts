import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerDeletedEvent } from '../impl/answer-deleted.event';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@EventsHandler(AnswerDeletedEvent)
export class AnswerDeletedProjection implements IEventHandler<AnswerDeletedEvent> {
  constructor(
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async handle(event: AnswerDeletedEvent) {
    const result = await this.answerReadRepo.delete({ id: event.answerId });

    console.log(
      `[AnswerDeletedProjection] Removed orphaned answer ${event.answerId} from read database; affected rows: ${result.affected}`,
    );
  }
}
