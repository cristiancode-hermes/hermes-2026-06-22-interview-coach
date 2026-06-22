import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InterviewsModule } from './interviews/interviews.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as any,
        database: config.get<string>('DATABASE_URL', 'data/interview-coach.db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    InterviewsModule,
    QuestionsModule,
    AnswersModule,
    FeedbackModule,
    AiAgentModule,
    SeedModule,
  ],
})
export class AppModule {}
