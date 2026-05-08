export class CreateQuestionCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
  ) {}
}
