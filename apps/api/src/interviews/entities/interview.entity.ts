import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => User, (user) => user.interviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  role: string; // 'frontend'|'backend'|'fullstack'|'data'|'devops'

  @Column()
  seniority: string; // 'junior'|'mid'|'senior'|'staff'

  @Column()
  type: string; // 'technical'|'behavioral'|'mixed'

  @Column({ type: 'text', nullable: true })
  technologies: string; // JSON array

  @Column({ nullable: true })
  targetCompany: string;

  @Column({ default: false })
  adaptiveMode: boolean;

  @Column({ default: 'draft' })
  status: string; // 'draft'|'in_progress'|'completed'|'cancelled'

  @Column({ default: 5 })
  totalQuestions: number;

  @Column({ type: 'real', nullable: true })
  avgScore: number | null;

  @Column({ nullable: true })
  duration: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: string;

  @OneToMany(() => Question, (question) => question.interview)
  questions: Question[];
}
