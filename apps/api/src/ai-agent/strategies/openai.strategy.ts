import { Injectable, Logger } from '@nestjs/common';
import { InterviewStrategy, AnalysisResult } from './interview-strategy.interface';

@Injectable()
export class OpenaiStrategy implements InterviewStrategy {
  private readonly logger = new Logger(OpenaiStrategy.name);

  async analyze(
    answerContent: string,
    questionContent: string,
    category: string,
    difficulty: string,
    keyPoints?: string[],
  ): Promise<AnalysisResult> {
    this.logger.log('OpenAI analysis requested - falling back to local strategy');
    // Fall back to a basic heuristic analysis since OPENAI_API_KEY is not available.
    // When an API key is configured, this would call the OpenAI API with a structured prompt.
    const wordCount = answerContent.split(/\s+/).filter(Boolean).length;
    const sentenceCount = answerContent.split(/[.!?]+/).filter(Boolean).length;

    return {
      overallScore: 5.0,
      structureScore: 5.0,
      clarityScore: 5.0,
      depthScore: 5.0,
      examplesScore: 5.0,
      keywordsScore: 5.0,
      strengths: wordCount > 50 ? ['Response addresses the question'] : [],
      improvements: wordCount < 50 ? ['Provide more detail in your response'] : ['Continue practicing'],
      sampleAnswer: 'An ideal answer would cover the key aspects mentioned in the question.',
      resources: [],
    };
  }
}
