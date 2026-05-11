export class AnswerSubmittedExternalEvent {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
  ) {}
}
