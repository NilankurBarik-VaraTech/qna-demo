import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateQuestionCommand } from '../impl/create-question.command';
import { Question } from '../../entities/question.entity';
import { QuestionCreatedEvent } from '../../events/impl/question-created.event';

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionHandler implements ICommandHandler<CreateQuestionCommand> {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<Question> {
    const { title, description } = command;

    const exists = await this.questionRepo.findOneBy({ title, description });
    if (exists) {
      throw new ConflictException('Question title already exists');
    }

    const newQuestion = this.questionRepo.create({ title, description });

    try {
      await this.questionRepo.save(newQuestion);
    } catch (error) {
      throw new InternalServerErrorException();
    }

    this.eventBus.publish(
      new QuestionCreatedEvent(newQuestion.id, title, description),
    );

    return newQuestion;
  }
}
