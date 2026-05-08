export class AnswerRejectedEvent {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
    public readonly reason: string,
  ) {}
}
