export class RequestAnswerValidationCommand {
  constructor(
    public readonly answerId: number,
    public readonly questionId: number,
  ) {}
}
