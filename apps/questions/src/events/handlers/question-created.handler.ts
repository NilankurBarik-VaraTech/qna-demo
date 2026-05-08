import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { QuestionCreatedEvent } from '../impl/question-created.event';

@EventsHandler(QuestionCreatedEvent)
export class QuestionCreatedHandler implements IEventHandler<QuestionCreatedEvent> {
  handle(event: QuestionCreatedEvent) {
    console.log(`Question created: ${event.id} - ${event.title}`);
    // Add additional event handling logic here (e.g., notifications, logging, etc.)
  }
}
