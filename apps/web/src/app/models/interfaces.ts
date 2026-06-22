export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface InterviewSession {
  id: number;
  userId: number;
  role: string;
  seniority: string;
  type: string;
  technologies: string;
  targetCompany: string;
  adaptiveMode: boolean;
  status: string;
  totalQuestions: number;
  avgScore: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSummary {
  id: number;
  role: string;
  seniority: string;
  type: string;
  avgScore: number | null;
  totalQuestions: number;
  duration: number | null;
  createdAt: string;
}

export interface InterviewDetail {
  id: number;
  userId: number;
  role: string;
  seniority: string;
  type: string;
  technologies: string;
  targetCompany: string;
  adaptiveMode: boolean;
  status: string;
  totalQuestions: number;
  avgScore: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Question {
  id: number;
  interviewId: number;
  content: string;
  category: string;
  difficulty: string;
  orderIndex: number;
  timeLimit: number;
  keyPoints: string | null;
  createdAt: string;
  answer?: Answer;
}

export interface Answer {
  id: number;
  questionId: number;
  content: string;
  timeSpent: number;
  autoSubmitted: boolean;
  createdAt: string;
  feedback?: FeedbackResult;
}

export interface FeedbackResult {
  id: number;
  answerId: number;
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
  createdAt: string;
}

export interface DashboardStats {
  totalInterviews: number;
  totalQuestions: number;
  avgScore: number;
  streak: number;
  recentSessions: InterviewSummary[];
  weaknessProfile: CategoryScore[];
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

export interface TopicSuggestion {
  category: string;
  reason: string;
  priority: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateInterviewDto {
  role: string;
  seniority: string;
  type: string;
  technologies: string;
  targetCompany?: string;
  adaptiveMode: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

export interface WeaknessProfile {
  categories: CategoryScore[];
  overallScore: number;
  suggestions: string[];
}
