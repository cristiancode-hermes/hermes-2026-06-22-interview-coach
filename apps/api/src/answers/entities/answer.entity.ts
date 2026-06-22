import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { User } from '../../users/entities/user.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'questionId', unique: true })
  questionId: number;

  @OneToOne(() => Question, (question) => question.answer)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column()
  timeSpent: number; // seconds

  @Column({ default: false })
  autoSubmitted: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @OneToOne(() => Feedback, (feedback) => feedback.answer)
  feedback: Feedback;
}
