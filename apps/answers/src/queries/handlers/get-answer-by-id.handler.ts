import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetAnswerByIdQuery } from '../impl/get-answer-by-id.query';
import { AnswerReadModel } from '../../entities/answer-read.entity';

@QueryHandler(GetAnswerByIdQuery)
export class GetAnswerByIdHandler implements IQueryHandler<GetAnswerByIdQuery> {
  constructor(
    @InjectRepository(AnswerReadModel, 'read')
    private answerReadRepo: Repository<AnswerReadModel>,
  ) {}

  async execute(query: GetAnswerByIdQuery): Promise<AnswerReadModel> {
    const { id } = query;
    
    const answer = await this.answerReadRepo.findOneBy({ id });
    
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }

    return answer;
  }
}
