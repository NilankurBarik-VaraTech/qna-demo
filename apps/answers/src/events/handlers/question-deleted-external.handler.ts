import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionDeletedExternalEvent } from '../impl/question-deleted-external.event';
import { DeleteAnswersByQuestionCommand } from '../../commands/impl/delete-answers-by-question.command';

@EventsHandler(QuestionDeletedExternalEvent)
export class QuestionDeletedExternalHandler 
  implements IEventHandler<QuestionDeletedExternalEvent> {
  
  constructor(private commandBus: CommandBus) {}

  async handle(event: QuestionDeletedExternalEvent) {
    console.log(
      `[QuestionDeletedExternalHandler] Received question deleted event for question ${event.questionId}`
    );
    
    // Trigger cascade deletion of answers
    await this.commandBus.execute(
      new DeleteAnswersByQuestionCommand(event.questionId)
    );
  }
}
