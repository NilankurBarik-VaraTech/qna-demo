import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateAnswerCommand } from '../impl/create-answer.command';
import { Answer } from '../../entities/answer.entity';
import { AnswerCreatedEvent } from '../../events/impl/answer-created.event';

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerHandler implements ICommandHandler<CreateAnswerCommand> {
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private eventBus: EventBus,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
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

    // Publish to Questions service for async validation (partition tolerance)
    // If Questions service is down, answer is still created and will be validated later
    void firstValueFrom(
      this.rabbitClient.emit('answer_submitted', {
        answerId: newAnswer.id,
        questionId: questionId,
      }),
    ).catch((error: Error) => {
      console.log(
        `[CreateAnswerHandler] Failed to publish answer ${newAnswer.id} for validation: ${error.message}`,
      );
      // Answer is still created - validation will happen when Questions service is back up
    });

    return newAnswer;
  }
}
