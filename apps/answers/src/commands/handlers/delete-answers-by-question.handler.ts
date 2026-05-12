import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteAnswersByQuestionCommand } from '../impl/delete-answers-by-question.command';
import { Answer } from '../../entities/answer.entity';
import { AnswerDeletedEvent } from '../../events/impl/answer-deleted.event';

@CommandHandler(DeleteAnswersByQuestionCommand)
export class DeleteAnswersByQuestionHandler implements ICommandHandler<DeleteAnswersByQuestionCommand> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private eventBus: EventBus,
  ) {}

  async execute(command: DeleteAnswersByQuestionCommand): Promise<void> {
    const { questionId } = command;

    const answers = await this.answerRepo.find({
      select: { id: true },
      where: { questionId },
    });

    const result = await this.answerRepo.delete({ questionId });

    console.log(
      `[DeleteAnswersByQuestionHandler] Deleted ${result.affected} answers for question ${questionId}`,
    );

    for (const answer of answers) {
      this.eventBus.publish(new AnswerDeletedEvent(answer.id));
    }
  }
}
