import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DeleteQuestionCommand } from '../impl/delete-question.command';
import { Question } from '../../entities/question.entity';
import { QuestionDeletedEvent } from '../../events/impl/question-deleted.event';

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler implements ICommandHandler<DeleteQuestionCommand> {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    private eventBus: EventBus,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { id } = command;

    const question = await this.questionRepo.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    await this.questionRepo.remove(question);

    // Publish event to update read model
    this.eventBus.publish(new QuestionDeletedEvent(id));

    // Publish to Answers service for cascade deletion (partition tolerance)
    void firstValueFrom(
      this.rabbitClient.emit('question_deleted', {
        questionId: id,
      }),
    ).catch((error: Error) => {
      console.log(
        `[DeleteQuestionHandler] Failed to publish question ${id} deletion: ${error.message}`,
      );
      // Question is still deleted - cascade will happen when Answers service is back up
    });
  }
}
