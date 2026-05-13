import { Test, TestingModule } from '@nestjs/testing';
import { AnswersController } from './answers.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('AnswersController', () => {
  let answersController: AnswersController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    answersController = app.get<AnswersController>(AnswersController);
    commandBus = app.get<CommandBus>(CommandBus);
    queryBus = app.get<QueryBus>(QueryBus);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(answersController.getHello()).toBe('Hello World!');
    });
  });
});
