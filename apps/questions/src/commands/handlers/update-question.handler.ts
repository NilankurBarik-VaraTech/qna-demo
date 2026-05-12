import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UpdateQuestionCommand } from '../impl/update-question.command';
import { Question } from '../../entities/question.entity';
import { QuestionUpdatedEvent } from '../../events/impl/question-updated.event';

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionHandler implements ICommandHandler<UpdateQuestionCommand> {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<Question> {
    const { id, title, description } = command;
    
    const question = await this.questionRepo.findOneBy({ id });
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    if (title !== undefined) {
      question.title = title;
    }
    
    if (description !== undefined) {
      question.description = description;
    }

    try {
      await this.questionRepo.save(question);
    } catch (error) {
      throw new InternalServerErrorException();
    }

    this.eventBus.publish(new QuestionUpdatedEvent(id, question.title, question.description));
    
    return question;
  }
}
