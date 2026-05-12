import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetQuestionByIdQuery } from '../impl/get-question-by-id.query';
import { QuestionReadModel } from '../../entities/question-read.entity';

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdHandler implements IQueryHandler<GetQuestionByIdQuery> {
  constructor(
    @InjectRepository(QuestionReadModel, 'read')
    private questionReadRepo: Repository<QuestionReadModel>,
  ) {}

  async execute(query: GetQuestionByIdQuery): Promise<QuestionReadModel> {
    const { id } = query;
    
    const question = await this.questionReadRepo.findOneBy({ id });
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }
}
