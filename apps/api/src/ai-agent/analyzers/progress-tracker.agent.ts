import { Injectable } from '@nestjs/common';

interface ProgressData {
  totalInterviews: number;
  completedInterviews: number;
  totalQuestions: number;
  answeredQuestions: number;
  averageScore: number;
  categoryScores: Record<string, number[]>;
  strongestCategory: string;
  weakestCategory: string;
  improvementRate: number;
}

@Injectable()
export class ProgressTrackerAgent {
  trackProgress(
    interviews: Array<{ status: string; totalQuestions: number; avgScore: number | null }>,
    answers: Array<{ feedback?: { overallScore: number } | null; question?: { category: string } | null }>,
  ): ProgressData {
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter((i) => i.status === 'completed').length;
    const totalQuestions = interviews.reduce((sum, i) => sum + i.totalQuestions, 0);
    const answeredQuestions = answers.length;

    const scores = answers
      .map((a) => a.feedback?.overallScore)
      .filter((s): s is number => s !== null && s !== undefined);

    const averageScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;

    const categoryScores: Record<string, number[]> = {};
    for (const answer of answers) {
      if (answer.feedback?.overallScore && answer.question?.category) {
        const cat = answer.question.category;
        if (!categoryScores[cat]) categoryScores[cat] = [];
        categoryScores[cat].push(answer.feedback.overallScore);
      }
    }

    const categoryAverages = Object.entries(categoryScores).map(([cat, catScores]) => ({
      category: cat,
      avgScore: catScores.reduce((sum, s) => sum + s, 0) / catScores.length,
    }));

    categoryAverages.sort((a, b) => b.avgScore - a.avgScore);

    return {
      totalInterviews,
      completedInterviews,
      totalQuestions,
      answeredQuestions,
      averageScore,
      categoryScores,
      strongestCategory: categoryAverages[0]?.category || 'N/A',
      weakestCategory: categoryAverages[categoryAverages.length - 1]?.category || 'N/A',
      improvementRate: completedInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0,
    };
  }
}
