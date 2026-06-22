export interface AnalysisResult {
  overallScore: number;
  structureScore: number;
  clarityScore: number;
  depthScore: number;
  examplesScore: number;
  keywordsScore: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
  resources: { title: string; url: string }[];
}

export interface InterviewStrategy {
  analyze(
    answerContent: string,
    questionContent: string,
    category: string,
    difficulty: string,
    keyPoints?: string[],
  ): Promise<AnalysisResult>;
}
