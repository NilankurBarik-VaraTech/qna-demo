import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateAnswerCommand } from '../impl/create-answer.command';
import { Answer } from '../../entities/answer.entity';
import { AnswerCreatedEvent } from '../../events/impl/answer-created.event';

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerHandler implements ICommandHandler<CreateAnswerCommand> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateAnswerCommand): Promise<Answer> {
    const { questionId, content } = command;

    const newAnswer = this.answerRepo.create({ questionId, content });

    try {
      await this.answerRepo.save(newAnswer);
    } catch (error) {
      throw new InternalServerErrorException();
    }

    this.eventBus.publish(
      new AnswerCreatedEvent(newAnswer.id, questionId, content),
    );

    return newAnswer;
  }
}
