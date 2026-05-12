import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnswerSagaStatus } from './answer-saga-status.enum';

@Entity('answer_saga_state')
export class AnswerSagaState {
  @PrimaryColumn()
  answerId: number;

  @Column()
  questionId: number;

  @Column({
    type: 'enum',
    enum: AnswerSagaStatus,
  })
  status: AnswerSagaStatus;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
