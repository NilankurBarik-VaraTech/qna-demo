import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QuestionsController } from './questions.controller';
import { Question } from './entities/question.entity';
import { QuestionReadModel } from './entities/question-read.entity';
import { CreateQuestionHandler } from './commands/handlers/create-question.handler';
import { DeleteQuestionHandler } from './commands/handlers/delete-question.handler';
import { UpdateQuestionHandler } from './commands/handlers/update-question.handler';
import { GetAllQuestionsHandler } from './queries/handlers/get-all-questions.handler';
import { CheckQuestionExistsHandler } from './queries/handlers/check-question-exists.handler';
import { GetQuestionByIdHandler } from './queries/handlers/get-question-by-id.handler';
import { QuestionCreatedProjection } from './events/handlers/question-created.projection';
import { QuestionDeletedProjection } from './events/handlers/question-deleted.projection';
import { QuestionUpdatedProjection } from './events/handlers/question-updated.projection';
import { AnswerSubmittedValidationHandler } from './events/handlers/answer-submitted-validation.handler';

const CommandHandlers = [
  CreateQuestionHandler,
  DeleteQuestionHandler,
  UpdateQuestionHandler,
];
const QueryHandlers = [
  GetAllQuestionsHandler,
  CheckQuestionExistsHandler,
  GetQuestionByIdHandler,
];
const EventHandlers = [
  AnswerSubmittedValidationHandler,
  QuestionCreatedProjection,
  QuestionDeletedProjection,
  QuestionUpdatedProjection,
];

@Module({
  imports: [
    // Write Database Connection
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: process.env.DB_WRITE_HOST || 'localhost',
      port: parseInt(process.env.DB_WRITE_PORT || '5432'),
      username: process.env.DB_WRITE_USERNAME || 'postgres',
      password: process.env.DB_WRITE_PASSWORD || 'postgres',
      database: process.env.DB_WRITE_NAME || 'questions_write_db',
      entities: [Question],
      synchronize: true,
    }),
    // Read Database Connection
    TypeOrmModule.forRoot({
      name: 'read',
      type: 'postgres',
      host: process.env.DB_READ_HOST || 'localhost',
      port: parseInt(process.env.DB_READ_PORT || '5432'),
      username: process.env.DB_READ_USERNAME || 'postgres',
      password: process.env.DB_READ_PASSWORD || 'postgres',
      database: process.env.DB_READ_NAME || 'questions_read_db',
      entities: [QuestionReadModel],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Question], 'default'),
    TypeOrmModule.forFeature([QuestionReadModel], 'read'),
    CqrsModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'answers_queue',
          queueOptions: {
            durable: true,
          },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class QuestionsModule {}
