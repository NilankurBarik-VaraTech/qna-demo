import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllQuestionsQuery } from '../impl/get-all-questions.query';
import { QuestionReadModel } from '../../entities/question-read.entity';

@QueryHandler(GetAllQuestionsQuery)
export class GetAllQuestionsHandler implements IQueryHandler<GetAllQuestionsQuery> {
  constructor(
    @InjectRepository(QuestionReadModel, 'read')
    private questionReadRepo: Repository<QuestionReadModel>,
  ) {}

  async execute(query: GetAllQuestionsQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.questionReadRepo.findAndCount({
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
