import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AnswerCreatedEvent } from '../impl/answer-created.event';

@EventsHandler(AnswerCreatedEvent)
export class AnswerCreatedHandler implements IEventHandler<AnswerCreatedEvent> {
  handle(event: AnswerCreatedEvent) {
    console.log(`Answer created: ${event.id} for question ${event.questionId}`);
    // Add additional event handling logic here (e.g., notifications, logging, etc.)
  }
}
