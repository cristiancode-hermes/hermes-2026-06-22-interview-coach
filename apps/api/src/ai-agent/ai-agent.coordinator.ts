import { Injectable, Logger } from '@nestjs/common';
import { InterviewStrategy, AnalysisResult } from './strategies/interview-strategy.interface';
import { LocalStrategy } from './strategies/local.strategy';
import { OpenaiStrategy } from './strategies/openai.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiAgentCoordinator {
  private readonly logger = new Logger(AiAgentCoordinator.name);
  private strategy: InterviewStrategy;

  constructor(
    private localStrategy: LocalStrategy,
    private openaiStrategy: OpenaiStrategy,
    private configService: ConfigService,
  ) {
    this.strategy = this.selectStrategy();
  }

  private selectStrategy(): InterviewStrategy {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey.length > 0) {
      this.logger.log('Using OpenAI strategy for analysis');
      return this.openaiStrategy;
    }
    this.logger.log('Using local heuristic strategy for analysis');
    return this.localStrategy;
  }

  async analyzeAnswer(answer: {
    content: string;
    question?: {
      content: string;
      category: string;
      difficulty: string;
      keyPoints?: string;
    };
  }): Promise<{
    overallScore: number;
    structureScore: number;
    clarityScore: number;
    depthScore: number;
    examplesScore: number;
    keywordsScore: number;
    strengths: string;
    improvements: string;
    sampleAnswer: string;
    resources: string;
    modelUsed: string;
  }> {
    const questionContent = answer.question?.content || '';
    const category = answer.question?.category || 'general';
    const difficulty = answer.question?.difficulty || 'medium';
    let keyPoints: string[] = [];
    if (answer.question?.keyPoints) {
      try {
        keyPoints = JSON.parse(answer.question.keyPoints);
      } catch {
        keyPoints = [];
      }
    }

    const result: AnalysisResult = await this.strategy.analyze(
      answer.content,
      questionContent,
      category,
      difficulty,
      keyPoints,
    );

    return {
      ...result,
      strengths: JSON.stringify(result.strengths),
      improvements: JSON.stringify(result.improvements),
      resources: JSON.stringify(result.resources),
      modelUsed: this.configService.get<string>('OPENAI_API_KEY') ? 'openai' : 'local',
    };
  }
}
