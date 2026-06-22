import { Injectable } from '@nestjs/common';

interface PastPerformance {
  category: string;
  score: number;
  count: number;
}

interface AdaptationResult {
  suggestedCategories: string[];
  difficultyAdjustment: string;
  focusAreas: string[];
}

@Injectable()
export class QuestionAdapterAgent {
  adapt(performances: PastPerformance[], interviewRole: string): AdaptationResult {
    if (performances.length === 0) {
      // No history - use defaults based on role
      return this.getDefaultAdaptation(interviewRole);
    }

    // Sort by score ascending (weakest areas first)
    const sorted = [...performances].sort((a, b) => a.score - b.score);
    const weakAreas = sorted.filter((p) => p.score < 6).slice(0, 3);
    const strongAreas = sorted.filter((p) => p.score >= 7);

    const suggestedCategories = weakAreas.length > 0
      ? weakAreas.map((p) => p.category)
      : sorted.slice(0, 3).map((p) => p.category);

    // Adjust difficulty based on performance
    const avgScore =
      performances.reduce((sum, p) => sum + p.score, 0) / performances.length;

    let difficultyAdjustment = 'medium';
    if (avgScore >= 7) difficultyAdjustment = 'hard';
    else if (avgScore <= 4) difficultyAdjustment = 'easy';

    const focusAreas = weakAreas.map((p) => `Improve ${p.category} (current score: ${p.score.toFixed(1)})`);

    return { suggestedCategories, difficultyAdjustment, focusAreas };
  }

  private getDefaultAdaptation(role: string): AdaptationResult {
    const roleCategories: Record<string, string[]> = {
      frontend: ['frontend', 'algorithms', 'system_design'],
      backend: ['backend', 'algorithms', 'system_design'],
      fullstack: ['frontend', 'backend', 'algorithms'],
      data: ['data', 'algorithms', 'system_design'],
      devops: ['devops', 'backend', 'system_design'],
    };

    return {
      suggestedCategories: roleCategories[role] || ['general', 'algorithms'],
      difficultyAdjustment: 'medium',
      focusAreas: ['Practice fundamentals in your role category'],
    };
  }
}
