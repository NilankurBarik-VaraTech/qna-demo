import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerCreatedEvent } from '../impl/answer-created.event';
import { Answer } from '../../entities/answer.entity';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@EventsHandler(AnswerCreatedEvent)
export class AnswerCreatedProjection implements IEventHandler<AnswerCreatedEvent> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async handle(event: AnswerCreatedEvent) {
    console.log(
      `[AnswerCreatedProjection] Projecting answer ${event.id} to read database`,
    );

    const currentAnswer = await this.answerRepo.findOne({
      where: { id: event.id },
    });

    if (!currentAnswer) {
      console.log(
        `[AnswerCreatedProjection] Answer ${event.id} no longer exists; skipping read projection`,
      );
      return;
    }

    const readModel = this.answerReadRepo.create({
      id: event.id,
      questionId: event.questionId,
      content: event.content,
      status: currentAnswer.status,
    });

    await this.answerReadRepo.save(readModel);

    console.log(
      `[AnswerCreatedProjection] Answer ${event.id} projected to read database`,
    );
  }
}
