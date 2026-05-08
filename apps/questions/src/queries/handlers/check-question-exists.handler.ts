import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckQuestionExistsQuery } from '../impl/check-question-exists.query';
import { Question } from '../../entities/question.entity';

@QueryHandler(CheckQuestionExistsQuery)
export class CheckQuestionExistsHandler implements IQueryHandler<CheckQuestionExistsQuery> {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async execute(query: CheckQuestionExistsQuery): Promise<boolean> {
    const count = await this.questionRepo.count({
      where: { id: query.id },
    });
    return count > 0;
  }
}
