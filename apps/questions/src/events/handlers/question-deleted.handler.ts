import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QuestionDeletedEvent } from '../impl/question-deleted.event';

@EventsHandler(QuestionDeletedEvent)
export class QuestionDeletedHandler implements IEventHandler<QuestionDeletedEvent> {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  handle(event: QuestionDeletedEvent) {
    console.log(`Question deleted: ${event.questionId}, publishing to RabbitMQ`);
    
    // Emit event to RabbitMQ for other services to consume
    this.rabbitClient.emit('question_deleted', {
      questionId: event.questionId,
    });
  }
}
