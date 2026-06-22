import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Answer } from '../../answers/entities/answer.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'answerId', unique: true })
  answerId: number;

  @OneToOne(() => Answer, (answer) => answer.feedback)
  @JoinColumn({ name: 'answerId' })
  answer: Answer;

  @Column({ type: 'real' })
  overallScore: number; // 1-10

  @Column({ type: 'real' })
  structureScore: number; // 1-10

  @Column({ type: 'real' })
  clarityScore: number; // 1-10

  @Column({ type: 'real' })
  depthScore: number; // 1-10

  @Column({ type: 'real' })
  examplesScore: number; // 1-10

  @Column({ type: 'real' })
  keywordsScore: number; // 1-10

  @Column({ type: 'text' })
  strengths: string; // JSON array

  @Column({ type: 'text' })
  improvements: string; // JSON array

  @Column({ type: 'text' })
  sampleAnswer: string;

  @Column({ type: 'text' })
  resources: string; // JSON array of { title, url }

  @Column({ default: 'local' })
  modelUsed: string; // 'openai'|'local'

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;
}
