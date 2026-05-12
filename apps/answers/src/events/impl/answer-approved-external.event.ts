export class AnswerApprovedExternalEvent {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
  ) {}
}
