import { AnswerStatus } from '../../entities/answer-status.enum';

export class AnswerCreatedEvent {
  constructor(
    public readonly id: number,
    public readonly questionId: number,
    public readonly content: string,
    public readonly status: AnswerStatus,
  ) {}
}
