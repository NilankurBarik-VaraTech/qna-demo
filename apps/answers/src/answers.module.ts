import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnswersController } from './answers.controller';
import { Answer } from './entities/answer.entity';
import { AnswerReadModel } from './entities/answer-read.entity';
import { AnswerSagaState } from './entities/answer-saga-state.entity';
import { CreateAnswerHandler } from './commands/handlers/create-answer.handler';
import { DeleteAnswerHandler } from './commands/handlers/delete-answer.handler';
import { DeleteAnswersByQuestionHandler } from './commands/handlers/delete-answers-by-question.handler';
import { UpdateAnswerHandler } from './commands/handlers/update-answer.handler';
import { RequestAnswerValidationHandler } from './commands/handlers/request-answer-validation.handler';
import { ApproveAnswerHandler } from './commands/handlers/approve-answer.handler';
import { GetAllAnswersHandler } from './queries/handlers/get-all-answers.handler';
import { GetAnswerByIdHandler } from './queries/handlers/get-answer-by-id.handler';
import { AnswerApprovedProjection } from './events/handlers/answer-approved.projection';
import { AnswerCreatedProjection } from './events/handlers/answer-created.projection';
import { AnswerDeletedProjection } from './events/handlers/answer-deleted.projection';
import { AnswerUpdatedProjection } from './events/handlers/answer-updated.projection';
import { QuestionDeletedCascadeHandler } from './events/handlers/question-deleted-cascade.handler';
import { AnswerCreationSaga } from './sagas/answer-creation.saga';

const CommandHandlers = [
  ApproveAnswerHandler,
  CreateAnswerHandler,
  DeleteAnswerHandler,
  DeleteAnswersByQuestionHandler,
  RequestAnswerValidationHandler,
  UpdateAnswerHandler,
];
const QueryHandlers = [GetAllAnswersHandler, GetAnswerByIdHandler];
const EventHandlers = [
  AnswerApprovedProjection,
  AnswerCreatedProjection,
  AnswerDeletedProjection,
  AnswerUpdatedProjection,
  QuestionDeletedCascadeHandler,
];
const Sagas = [AnswerCreationSaga];

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
      entities: [Answer, AnswerSagaState],
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
    TypeOrmModule.forFeature([Answer, AnswerSagaState], 'default'),
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
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers, ...Sagas],
})
export class AnswersModule {}
