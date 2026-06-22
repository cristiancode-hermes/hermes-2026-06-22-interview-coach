import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InterviewService } from '../services/interview.service';
import { SkeletonComponent } from '../components/shared/skeleton.component';
import { ErrorStateComponent } from '../components/shared/error-state.component';
import { ButtonComponent } from '../components/shared/button.component';
import { BadgeComponent } from '../components/shared/badge.component';

@Component({
  selector: 'app-interview-summary-page',
  standalone: true,
  imports: [RouterLink, SkeletonComponent, ErrorStateComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="space-y-6">
          <app-skeleton height="8rem" width="200px" class="mx-auto" />
          <app-skeleton height="12rem" />
          <app-skeleton height="8rem" />
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()!" [retryable]="true" (retry)="loadSession()" />
      } @else if (session()) {
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Interview Complete!</h1>
          <p class="text-neutral-500 mt-1">{{ session()!.role }} · {{ session()!.seniority }}</p>
        </div>

        <!-- Overall Score -->
        <div class="flex justify-center mb-8">
          <div class="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
            <div class="relative w-32 h-32 mx-auto mb-4">
              <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-neutral-200 dark:text-neutral-700"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8"
                        stroke-dasharray="251.2"
                        [attr.stroke-dashoffset]="251.2 - (251.2 * avgScore() / 10)"
                        [class.text-secondary-500]="avgScore() >= 7"
                        [class.text-warning-500]="avgScore() >= 4 && avgScore() < 7"
                        [class.text-danger-500]="avgScore() < 4"
                        class="transition-all duration-1000"/>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-3xl font-bold"
                    [class.text-secondary-500]="avgScore() >= 7"
                    [class.text-warning-500]="avgScore() >= 4 && avgScore() < 7"
                    [class.text-danger-500]="avgScore() < 4">
                {{ avgScore().toFixed(1) }}
              </span>
            </div>
            <p class="text-sm text-neutral-500">Average Score</p>
          </div>
        </div>

        <!-- Session Timeline -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 mb-6">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Session Timeline</h2>
          </div>
          <div class="p-6 space-y-3">
            @for (q of questions(); track q.id; let i = $index) {
              <div class="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-medium text-neutral-500">Q{{ i + 1 }}</span>
                  <app-badge [text]="q.category" type="primary" />
                  <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ q.content.substring(0, 60) }}...</span>
                </div>
                @if (q.answer?.feedback) {
                  <span class="text-sm font-semibold"
                        [class.text-secondary-500]="q.answer.feedback.overallScore >= 7"
                        [class.text-warning-500]="q.answer.feedback.overallScore >= 4 && q.answer.feedback.overallScore < 7"
                        [class.text-danger-500]="q.answer.feedback.overallScore < 4">
                    {{ q.answer.feedback.overallScore.toFixed(1) }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 mb-8">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Category Breakdown</h2>
          </div>
          <div class="p-6 space-y-4">
            @for (cat of categoryScores(); track cat.category) {
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ cat.category }}</span>
                  <span class="text-sm font-medium"
                        [class.text-secondary-500]="cat.score >= 7"
                        [class.text-warning-500]="cat.score >= 4 && cat.score < 7"
                        [class.text-danger-500]="cat.score < 4">
                    {{ cat.score.toFixed(1) }}/10
                  </span>
                </div>
                <div class="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                       [style.width.%]="cat.score * 10"
                       [class.bg-secondary-500]="cat.score >= 7"
                       [class.bg-warning-500]="cat.score >= 4 && cat.score < 7"
                       [class.bg-danger-500]="cat.score < 4">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4">
          <a routerLink="/dashboard" class="px-6 py-2.5 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Dashboard
          </a>
          <a routerLink="/interview/new" class="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
            New Interview
          </a>
        </div>
      }
    </div>
  `
})
export default class InterviewSummaryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly interviewService = inject(InterviewService);

  protected readonly session = signal<any>(null);
  protected readonly questions = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly avgScore = computed(() => {
    const scores = this.questions()
      .filter(q => q.answer?.feedback?.overallScore != null)
      .map(q => q.answer.feedback.overallScore);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  });

  protected readonly categoryScores = computed(() => {
    const map = new Map<string, number[]>();
    for (const q of this.questions()) {
      if (q.answer?.feedback?.overallScore != null) {
        const list = map.get(q.category) || [];
        list.push(q.answer.feedback.overallScore);
        map.set(q.category, list);
      }
    }
    return Array.from(map.entries()).map(([category, scores]) => ({
      category,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
  });

  constructor() {
    this.loadSession();
  }

  protected async loadSession(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const session = await this.interviewService.getById(id);
      this.session.set(session);
      this.questions.set(session.questions || []);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load summary');
    } finally {
      this.loading.set(false);
    }
  }
}
