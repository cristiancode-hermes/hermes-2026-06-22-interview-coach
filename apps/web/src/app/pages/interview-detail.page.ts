import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InterviewService } from '../services/interview.service';
import { SkeletonComponent } from '../components/shared/skeleton.component';
import { ErrorStateComponent } from '../components/shared/error-state.component';
import { BadgeComponent } from '../components/shared/badge.component';

@Component({
  selector: 'app-interview-detail-page',
  standalone: true,
  imports: [RouterLink, SkeletonComponent, ErrorStateComponent, BadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a routerLink="/history" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to History
      </a>

      @if (loading()) {
        <div class="space-y-6">
          <app-skeleton height="2rem" />
          <app-skeleton height="12rem" />
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()!" [retryable]="true" (retry)="loadDetail()" />
      } @else if (session()) {
        <!-- Header -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{{ session()!.role }} Interview</h1>
              <p class="text-sm text-neutral-500 mt-1">{{ session()!.seniority }} · {{ session()!.type }} · {{ session()!.createdAt }}</p>
            </div>
            <div class="text-right">
              @if (session()!.avgScore != null) {
                <p class="text-3xl font-bold"
                   [class.text-secondary-500]="session()!.avgScore >= 7"
                   [class.text-warning-500]="session()!.avgScore >= 4 && session()!.avgScore < 7"
                   [class.text-danger-500]="session()!.avgScore < 4">
                  {{ session()!.avgScore.toFixed(1) }}
                </p>
                <p class="text-xs text-neutral-500">avg score</p>
              }
            </div>
          </div>
        </div>

        <!-- Questions Review -->
        <div class="space-y-4">
          @for (q of questions(); track q.id; let i = $index) {
            <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <button (click)="toggleQuestion(i)" class="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-medium text-neutral-500">Q{{ i + 1 }}</span>
                  <app-badge [text]="q.category" type="primary" />
                  <app-badge [text]="q.difficulty" type="warning" />
                  <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ q.content.substring(0, 80) }}{{ q.content.length > 80 ? '...' : '' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  @if (q.answer?.feedback?.overallScore != null) {
                    <span class="text-sm font-semibold"
                          [class.text-secondary-500]="q.answer.feedback.overallScore >= 7"
                          [class.text-warning-500]="q.answer.feedback.overallScore >= 4 && q.answer.feedback.overallScore < 7"
                          [class.text-danger-500]="q.answer.feedback.overallScore < 4">
                      {{ q.answer.feedback.overallScore.toFixed(1) }}
                    </span>
                  }
                  <svg class="w-4 h-4 text-neutral-400 transition-transform" [class.rotate-180]="expandedQuestions()[i]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </button>

              @if (expandedQuestions()[i]) {
                <div class="px-6 pb-4 space-y-4 border-t border-neutral-100 dark:border-neutral-700 pt-4">
                  <div>
                    <p class="text-xs font-medium text-neutral-500 mb-1">Question</p>
                    <p class="text-sm text-neutral-900 dark:text-neutral-100">{{ q.content }}</p>
                  </div>

                  @if (q.answer) {
                    <div>
                      <p class="text-xs font-medium text-neutral-500 mb-1">Your Answer</p>
                      <p class="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-700/50 p-3 rounded-lg">{{ q.answer.content }}</p>
                    </div>

                    @if (q.answer.feedback) {
                      <div>
                        <p class="text-xs font-medium text-neutral-500 mb-1">Feedback</p>
                        <div class="space-y-2">
                          <p class="text-sm text-neutral-700 dark:text-neutral-300"><strong>Strengths:</strong> {{ q.answer.feedback.strengths }}</p>
                          <p class="text-sm text-neutral-700 dark:text-neutral-300"><strong>Improvements:</strong> {{ q.answer.feedback.improvements }}</p>
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export default class InterviewDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly interviewService = inject(InterviewService);

  protected readonly session = signal<any>(null);
  protected readonly questions = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly expandedQuestions = signal<Record<number, boolean>>({});

  constructor() {
    this.loadDetail();
  }

  protected async loadDetail(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const session = await this.interviewService.getById(id);
      this.session.set(session);
      this.questions.set(session.questions || []);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load interview detail');
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleQuestion(index: number): void {
    this.expandedQuestions.update(m => ({ ...m, [index]: !m[index] }));
  }
}
