import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteAnswerCommand } from '../impl/delete-answer.command';
import { AnswerDeletedEvent } from '../../events/impl/answer-deleted.event';
import { Answer } from '../../entities/answer.entity';

@CommandHandler(DeleteAnswerCommand)
export class DeleteAnswerHandler implements ICommandHandler<DeleteAnswerCommand> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteAnswerCommand): Promise<void> {
    const result = await this.answerRepo.delete({ id: command.answerId });

    console.log(
      `[DeleteAnswerHandler] Deleted orphaned answer ${command.answerId}; affected rows: ${result.affected}`,
    );

    if (result.affected) {
      this.eventBus.publish(new AnswerDeletedEvent(command.answerId));
    }
  }
}
