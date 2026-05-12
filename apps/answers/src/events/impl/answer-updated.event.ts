export class AnswerUpdatedEvent {
  constructor(
    public readonly id: number,
    public readonly questionId: number,
    public readonly content: string,
  ) {}
}
