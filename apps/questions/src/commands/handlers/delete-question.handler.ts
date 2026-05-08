import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeleteQuestionCommand } from '../impl/delete-question.command';
import { Question } from '../../entities/question.entity';
import { QuestionDeletedEvent } from '../../events/impl/question-deleted.event';

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler implements ICommandHandler<DeleteQuestionCommand> {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { id } = command;
    
    const question = await this.questionRepo.findOne({ where: { id } });
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    await this.questionRepo.remove(question);

    // Publish event to trigger cascade deletion in Answers service
    this.eventBus.publish(new QuestionDeletedEvent(id));
  }
}
