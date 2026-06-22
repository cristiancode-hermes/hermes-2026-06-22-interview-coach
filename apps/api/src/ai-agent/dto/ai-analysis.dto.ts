export class AiAnalysisDto {
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
  modelUsed: string;
}
