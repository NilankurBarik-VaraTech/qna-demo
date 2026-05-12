import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UpdateAnswerCommand } from '../impl/update-answer.command';
import { Answer } from '../../entities/answer.entity';
import { AnswerUpdatedEvent } from '../../events/impl/answer-updated.event';

@CommandHandler(UpdateAnswerCommand)
export class UpdateAnswerHandler implements ICommandHandler<UpdateAnswerCommand> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateAnswerCommand): Promise<Answer> {
    const { id, content } = command;
    
    const answer = await this.answerRepo.findOneBy({ id });
    
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }

    answer.content = content;

    try {
      await this.answerRepo.save(answer);
    } catch (error) {
      throw new InternalServerErrorException();
    }

    this.eventBus.publish(new AnswerUpdatedEvent(id, answer.questionId, content));
    
    return answer;
  }
}
