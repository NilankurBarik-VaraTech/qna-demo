import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DeleteAnswerCommand } from '../../commands/impl/delete-answer.command';
import { AnswerRejectedExternalEvent } from '../impl/answer-rejected-external.event';

@EventsHandler(AnswerRejectedExternalEvent)
export class AnswerRejectedCleanupHandler implements IEventHandler<AnswerRejectedExternalEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: AnswerRejectedExternalEvent): Promise<void> {
    console.log(
      `[AnswerRejectedCleanupHandler] Answer ${event.answerId} rejected by questions service: ${event.reason}`,
    );

    await this.commandBus.execute(new DeleteAnswerCommand(event.answerId));
  }
}
