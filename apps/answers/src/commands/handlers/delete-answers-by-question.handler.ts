import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteAnswersByQuestionCommand } from '../impl/delete-answers-by-question.command';
import { Answer } from '../../entities/answer.entity';

@CommandHandler(DeleteAnswersByQuestionCommand)
export class DeleteAnswersByQuestionHandler 
  implements ICommandHandler<DeleteAnswersByQuestionCommand> {
  
  constructor(
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  async execute(command: DeleteAnswersByQuestionCommand): Promise<void> {
    const { questionId } = command;
    
    const result = await this.answerRepo.delete({ questionId });
    
    console.log(
      `[DeleteAnswersByQuestionHandler] Deleted ${result.affected} answers for question ${questionId}`
    );
  }
}
