export class GetAllAnswersQuery {
  constructor(
    public readonly questionId: number,
    public readonly page: number = 1,
    public readonly limit: number = 2,
  ) {}
}
