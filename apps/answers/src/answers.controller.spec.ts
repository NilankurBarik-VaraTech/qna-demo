import { Test, TestingModule } from '@nestjs/testing';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';

describe('AnswersController', () => {
  let answersController: AnswersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [AnswersService],
    }).compile();

    answersController = app.get<AnswersController>(AnswersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(answersController.getHello()).toBe('Hello World!');
    });
  });
});
