import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DeleteAnswersByQuestionCommand } from '../../commands/impl/delete-answers-by-question.command';
import { QuestionDeletedExternalEvent } from '../impl/question-deleted-external.event';

@EventsHandler(QuestionDeletedExternalEvent)
export class QuestionDeletedCascadeHandler implements IEventHandler<QuestionDeletedExternalEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: QuestionDeletedExternalEvent): Promise<void> {
    console.log(
      `[QuestionDeletedCascadeHandler] Question ${event.questionId} deleted, cascading to delete answers`,
    );

    await this.commandBus.execute(
      new DeleteAnswersByQuestionCommand(event.questionId),
    );
  }
}
