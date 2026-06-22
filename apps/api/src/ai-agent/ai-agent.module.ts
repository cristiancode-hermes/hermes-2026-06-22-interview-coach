import { Module } from '@nestjs/common';
import { AiAgentCoordinator } from './ai-agent.coordinator';
import { LocalStrategy } from './strategies/local.strategy';
import { OpenaiStrategy } from './strategies/openai.strategy';
import { AnswerAnalyzerAgent } from './analyzers/answer-analyzer.agent';
import { QuestionAdapterAgent } from './analyzers/question-adapter.agent';
import { ProgressTrackerAgent } from './analyzers/progress-tracker.agent';

@Module({
  providers: [
    AiAgentCoordinator,
    LocalStrategy,
    OpenaiStrategy,
    AnswerAnalyzerAgent,
    QuestionAdapterAgent,
    ProgressTrackerAgent,
  ],
  exports: [
    AiAgentCoordinator,
    LocalStrategy,
    OpenaiStrategy,
    AnswerAnalyzerAgent,
    QuestionAdapterAgent,
    ProgressTrackerAgent,
  ],
})
export class AiAgentModule {}
