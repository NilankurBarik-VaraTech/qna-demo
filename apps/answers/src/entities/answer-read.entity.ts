import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { AnswerStatus } from './answer-status.enum';

@Entity('answer_read_model')
export class AnswerReadModel {
  @PrimaryColumn()
  id: number;

  @Column()
  questionId: number;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: AnswerStatus,
    default: AnswerStatus.Approved,
  })
  status: AnswerStatus;

  @CreateDateColumn()
  createdAt: Date;
}
