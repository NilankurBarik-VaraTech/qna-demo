export class UpdateQuestionCommand {
  constructor(
    public readonly id: number,
    public readonly title?: string,
    public readonly description?: string,
  ) {}
}
