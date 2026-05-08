export class AnswerCreationRequestedEvent {
  constructor(
    public readonly questionId: number,
    public readonly content: string,
  ) {}
}
