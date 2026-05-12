import { AnswerStatus } from '../../entities/answer-status.enum';

export class AnswerApprovedEvent {
  public readonly status = AnswerStatus.Approved;

  constructor(public readonly answerId: number) {}
}
