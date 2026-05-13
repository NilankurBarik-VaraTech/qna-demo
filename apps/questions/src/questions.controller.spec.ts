import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('QuestionsController', () => {
  let questionsController: QuestionsController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
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

    questionsController = app.get<QuestionsController>(QuestionsController);
    commandBus = app.get<CommandBus>(CommandBus);
    queryBus = app.get<QueryBus>(QueryBus);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(questionsController.getHello()).toBe('Hello World!');
    });
  });
});
