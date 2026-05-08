export class AnswerSubmittedEvent {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
  ) {}
}
