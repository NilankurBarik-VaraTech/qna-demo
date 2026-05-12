export class AnswerCreatedExternalEvent {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
  ) {}
}
