import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RequestAnswerValidationCommand } from '../impl/request-answer-validation.command';

@CommandHandler(RequestAnswerValidationCommand)
export class RequestAnswerValidationHandler implements ICommandHandler<RequestAnswerValidationCommand> {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async execute(command: RequestAnswerValidationCommand): Promise<void> {
    try {
      await firstValueFrom(
        this.rabbitClient.emit('answer_created', {
          answerId: command.answerId,
          questionId: command.questionId,
        }),
      );

      console.log(
        `[RequestAnswerValidationHandler] Requested validation for answer ${command.answerId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(
        `[RequestAnswerValidationHandler] Could not request validation for answer ${command.answerId}: ${message}`,
      );
    }
  }
}
