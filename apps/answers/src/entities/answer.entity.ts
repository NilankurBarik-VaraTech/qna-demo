import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { AnswerStatus } from './answer-status.enum';

@Entity()
export class Answer extends BaseEntity {
  @PrimaryGeneratedColumn()
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
}
