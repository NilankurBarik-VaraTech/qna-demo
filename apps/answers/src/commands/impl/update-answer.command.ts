export class UpdateAnswerCommand {
  constructor(
    public readonly id: number,
    public readonly content: string,
  ) {}
}
