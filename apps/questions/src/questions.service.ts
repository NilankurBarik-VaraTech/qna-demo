import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}
  async createQuestions(question: CreateQuestionDto) {
    const newQuestion = await this.questionRepo.create(question);
    const exists = await this.questionRepo.findOneBy(question);
    if (exists) {
      throw new ConflictException('Question title already exists');
    }
    try {
      await this.questionRepo.save(newQuestion);
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return newQuestion;
  }
  async getAllQuestions(page: number = 1, limit: number = 3) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.questionRepo.findAndCount({
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
