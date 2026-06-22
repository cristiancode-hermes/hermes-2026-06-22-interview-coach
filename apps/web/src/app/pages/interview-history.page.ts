import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InterviewService } from '../services/interview.service';
import { SkeletonComponent } from '../components/shared/skeleton.component';
import { EmptyStateComponent } from '../components/shared/empty-state.component';
import { ErrorStateComponent } from '../components/shared/error-state.component';
import { BadgeComponent } from '../components/shared/badge.component';

@Component({
  selector: 'app-interview-history-page',
  standalone: true,
  imports: [RouterLink, SkeletonComponent, EmptyStateComponent, ErrorStateComponent, BadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Interview History</h1>

      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [1,2,3,4,5]; track $index) {
            <app-skeleton height="4rem" />
          }
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()!" [retryable]="true" (retry)="loadHistory()" />
      } @else if (interviews().length === 0) {
        <app-empty-state
          icon='<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>'
          title="No interviews yet"
          subtitle="Complete your first interview to see it here"
          actionText="Start Interview"
          actionLink="/interview/new"
        />
      } @else {
        <div class="space-y-3">
          @for (item of interviews(); track item.id) {
            <a [routerLink]="['/history', item.id]" class="block bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-semibold">
                    {{ item.role?.substring(0, 2)?.toUpperCase() || '?' }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ item.role }} · {{ item.seniority }}</p>
                    <p class="text-xs text-neutral-500">{{ item.createdAt }} · {{ item.duration ? item.duration + 's' : '-' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <app-badge [text]="item.type" type="primary" />
                  @if (item.avgScore != null) {
                    <span class="text-sm font-bold"
                          [class.text-secondary-500]="item.avgScore >= 7"
                          [class.text-warning-500]="item.avgScore >= 4 && item.avgScore < 7"
                          [class.text-danger-500]="item.avgScore < 4">
                      {{ item.avgScore.toFixed(1) }}
                    </span>
                  }
                  <svg class="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export default class InterviewHistoryPage {
  private readonly interviewService = inject(InterviewService);

  protected readonly interviews = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.loadHistory();
  }

  protected async loadHistory(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.interviewService.getAll(1, { limit: 50 });
      this.interviews.set(res.data || res || []);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load history');
    } finally {
      this.loading.set(false);
    }
  }
}
