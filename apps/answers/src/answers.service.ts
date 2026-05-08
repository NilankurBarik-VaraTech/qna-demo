import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';

type CreateAnswerPayload = CreateAnswerDto & {
  questionId: number;
};

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  async createAnswer(answer: CreateAnswerPayload) {
    const newAnswer = await this.answerRepo.create(answer);
    try {
      await this.answerRepo.save(newAnswer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return newAnswer;
  }

  async getAllAnswers(id: number, page: number = 1, limit: number = 2) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.answerRepo.findAndCount({
      where: { questionId: id },
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
        questionId: id,
      },
    };
  }
}
