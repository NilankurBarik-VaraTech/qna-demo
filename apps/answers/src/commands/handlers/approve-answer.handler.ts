import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproveAnswerCommand } from '../impl/approve-answer.command';
import { Answer } from '../../entities/answer.entity';
import { AnswerStatus } from '../../entities/answer-status.enum';
import { AnswerApprovedEvent } from '../../events/impl/answer-approved.event';

@CommandHandler(ApproveAnswerCommand)
export class ApproveAnswerHandler implements ICommandHandler<ApproveAnswerCommand> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private eventBus: EventBus,
  ) {}

  async execute(command: ApproveAnswerCommand): Promise<void> {
    const answer = await this.answerRepo.findOne({
      where: { id: command.answerId },
    });

    if (!answer) {
      console.log(
        `[ApproveAnswerHandler] Answer ${command.answerId} not found; ignoring approval`,
      );
      return;
    }

    if (answer.status === AnswerStatus.Approved) {
      console.log(
        `[ApproveAnswerHandler] Answer ${command.answerId} already approved`,
      );
      return;
    }

    answer.status = AnswerStatus.Approved;
    await this.answerRepo.save(answer);

    this.eventBus.publish(new AnswerApprovedEvent(answer.id));
  }
}
