import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnswersController } from './answers.controller';
import { Answer } from './entities/answer.entity';
import { AnswerReadModel } from './entities/answer-read.entity';
import { CreateAnswerHandler } from './commands/handlers/create-answer.handler';
import { DeleteAnswerHandler } from './commands/handlers/delete-answer.handler';
import { DeleteAnswersByQuestionHandler } from './commands/handlers/delete-answers-by-question.handler';
import { GetAllAnswersHandler } from './queries/handlers/get-all-answers.handler';
import { AnswerCreatedHandler } from './events/handlers/answer-created.handler';
import { AnswerCreatedProjection } from './events/handlers/answer-created.projection';
import { AnswerDeletedProjection } from './events/handlers/answer-deleted.projection';
import { AnswersQuestionDeletedProjection } from './events/handlers/question-deleted.projection';
import { AnswerSaga } from './sagas/answer.saga';

const CommandHandlers = [
  CreateAnswerHandler,
  DeleteAnswerHandler,
  DeleteAnswersByQuestionHandler,
];
const QueryHandlers = [GetAllAnswersHandler];
const EventHandlers = [AnswerCreatedHandler];
const Projections = [
  AnswerCreatedProjection,
  AnswerDeletedProjection,
  AnswersQuestionDeletedProjection,
];
const Sagas = [AnswerSaga];

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
      database: process.env.DB_WRITE_NAME || 'answers_write_db',
      entities: [Answer],
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
      database: process.env.DB_READ_NAME || 'answers_read_db',
      entities: [AnswerReadModel],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Answer], 'default'),
    TypeOrmModule.forFeature([AnswerReadModel], 'read'),
    CqrsModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'questions_queue',
          queueOptions: {
            durable: true,
          },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [AnswersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ...Projections,
    ...Sagas,
  ],
})
export class AnswersModule {}
