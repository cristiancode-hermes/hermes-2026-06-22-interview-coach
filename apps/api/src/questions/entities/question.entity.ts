import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { InterviewSession } from '../../interviews/entities/interview.entity';
import { Answer } from '../../answers/entities/answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'interviewId' })
  interviewId: number;

  @ManyToOne(() => InterviewSession, (interview) => interview.questions)
  @JoinColumn({ name: 'interviewId' })
  interview: InterviewSession;

  @Column({ type: 'text' })
  content: string;

  @Column()
  category: string; // 'algorithms'|'system_design'|'frontend'|'backend'|'data'|'behavioral'|'general'

  @Column({ default: 'medium' })
  difficulty: string; // 'easy'|'medium'|'hard'

  @Column()
  orderIndex: number;

  @Column({ default: 180 })
  timeLimit: number;

  @Column({ type: 'text', nullable: true })
  keyPoints: string; // JSON array

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @OneToOne(() => Answer, (answer) => answer.question)
  answer: Answer;
}
