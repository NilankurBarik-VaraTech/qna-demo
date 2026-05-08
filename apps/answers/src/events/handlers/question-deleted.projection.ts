import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionDeletedExternalEvent } from '../impl/question-deleted-external.event';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@EventsHandler(QuestionDeletedExternalEvent)
export class AnswersQuestionDeletedProjection implements IEventHandler<QuestionDeletedExternalEvent> {
  constructor(
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async handle(event: QuestionDeletedExternalEvent) {
    console.log(`[AnswersQuestionDeletedProjection] Removing answers for question ${event.questionId} from read database`);
    
    const result = await this.answerReadRepo.delete({ questionId: event.questionId });
    
    console.log(`[AnswersQuestionDeletedProjection] Removed ${result.affected} answers from read database`);
  }
}
