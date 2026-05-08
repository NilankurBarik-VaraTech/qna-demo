export class CreateAnswerCommand {
  constructor(
    public readonly questionId: number,
    public readonly content: string,
  ) {}
}
