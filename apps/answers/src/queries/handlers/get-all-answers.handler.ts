import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllAnswersQuery } from '../impl/get-all-answers.query';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@QueryHandler(GetAllAnswersQuery)
export class GetAllAnswersHandler implements IQueryHandler<GetAllAnswersQuery> {
  constructor(
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async execute(query: GetAllAnswersQuery) {
    const { questionId, page, limit } = query;
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.answerReadRepo.findAndCount({
      where: { questionId },
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
        questionId,
      },
    };
  }
}
