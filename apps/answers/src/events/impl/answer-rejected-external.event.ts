export class AnswerRejectedExternalEvent {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
    public readonly reason: string,
  ) {}
}
