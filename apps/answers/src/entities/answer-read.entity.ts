import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('answer_read_model')
export class AnswerReadModel {
  @PrimaryColumn()
  id: number;

  @Column()
  questionId: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
