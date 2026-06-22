import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InterviewService } from '../services/interview.service';
import { AIAgentService } from '../services/ai-agent.service';
import { ToastService } from '../services/toast.service';
import { SkeletonComponent } from '../components/shared/skeleton.component';
import { EmptyStateComponent } from '../components/shared/empty-state.component';
import { ErrorStateComponent } from '../components/shared/error-state.component';
import { BadgeComponent } from '../components/shared/badge.component';
import { CardComponent } from '../components/shared/card.component';
import type { DashboardStats, InterviewSummary, CategoryScore } from '../models/interfaces';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, SkeletonComponent, EmptyStateComponent, ErrorStateComponent, BadgeComponent, CardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Welcome back, {{ auth.currentUser()?.name }}</p>
        </div>
        <a routerLink="/interview/new" class="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          New Interview
        </a>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <app-skeleton width="80px" height="0.75rem" />
              <app-skeleton width="60px" height="2rem" class="mt-2" />
            </div>
          }
        </div>
        <div class="grid lg:grid-cols-2 gap-8">
          <app-skeleton height="16rem" />
          <app-skeleton height="16rem" />
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()!" [retryable]="true" (retry)="loadData()" />
      } @else if (!stats()) {
        <app-empty-state
          icon='<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>'
          title="No interviews yet"
          subtitle="Start your first practice interview to see insights here"
          actionText="Start Interview"
          actionLink="/interview/new"
        />
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Interviews</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ stats()!.totalInterviews }}</p>
          </div>
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Questions Answered</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ stats()!.totalQuestions }}</p>
          </div>
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Avg Score</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ stats()!.avgScore.toFixed(1) }}</p>
          </div>
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Streak</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ stats()!.streak }} days</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Weakness Profile -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Weakness Profile</h2>
            <div class="space-y-4">
              @for (cat of stats()!.weaknessProfile; track cat.category) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ cat.category }}</span>
                <span class="text-sm font-medium" [class.text-secondary-500]="(cat.score / cat.maxScore) >= 0.7" [class.text-warning-500]="(cat.score / cat.maxScore) >= 0.4 && (cat.score / cat.maxScore) < 0.7" [class.text-danger-500]="(cat.score / cat.maxScore) < 0.4">{{ cat.score }}/{{ cat.maxScore }}</span>
                  </div>
                  <div class="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500"
                         [style.width.%]="(cat.score / cat.maxScore) * 100"
                         [class.bg-primary-500]="(cat.score / cat.maxScore) >= 0.7"
                         [class.bg-warning-500]="(cat.score / cat.maxScore) >= 0.4 && (cat.score / cat.maxScore) < 0.7"
                         [class.bg-danger-500]="(cat.score / cat.maxScore) < 0.4">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent Sessions -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Recent Sessions</h2>
            @if (stats()!.recentSessions.length === 0) {
              <p class="text-sm text-neutral-500 dark:text-neutral-400">No sessions yet</p>
            } @else {
              <div class="space-y-3">
                @for (session of stats()!.recentSessions; track session.id) {
                  <a [routerLink]="['/history', session.id]" class="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <div>
                      <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ session.role }}</p>
                      <p class="text-xs text-neutral-500">{{ session.createdAt }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <app-badge [text]="session.type || session.seniority" type="primary" />
                      @if (session.avgScore != null) {
                        <span class="text-sm font-semibold"
                              [class.text-secondary-500]="session.avgScore >= 7"
                              [class.text-warning-500]="session.avgScore >= 4 && session.avgScore < 7"
                              [class.text-danger-500]="session.avgScore < 4">
                          {{ session.avgScore.toFixed(1) }}
                        </span>
                      }
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="mt-8 text-center">
          <a routerLink="/interview/new" class="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-xl text-base font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Start New Interview
          </a>
        </div>
      }
    </div>
  `
})
export default class DashboardPage {
  protected readonly auth = inject(AuthService);
  private readonly interviewService = inject(InterviewService);
  private readonly aiAgentService = inject(AIAgentService);
  private readonly toast = inject(ToastService);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.loadData();
  }

  protected async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [recentSessions, weaknessProfile, allInterviews] = await Promise.all([
        this.interviewService.getRecent(),
        this.aiAgentService.getProfile(),
        this.interviewService.getAll(1, { limit: 100 }),
      ]);

      const totalSessions = allInterviews.data || allInterviews;
      const totalInterviews = Array.isArray(totalSessions) ? totalSessions.length : totalSessions.total || 0;
      const totalQuestions = (recentSessions as any[]).reduce((sum: number, s: any) => sum + (s.totalQuestions || 0), 0);
      const scores = (recentSessions as any[]).filter((s: any) => s.avgScore != null).map((s: any) => s.avgScore);
      const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

      const categories: CategoryScore[] = weaknessProfile?.categories || [
        { category: 'Problem Solving', score: 0, maxScore: 10 },
        { category: 'Communication', score: 0, maxScore: 10 },
        { category: 'Technical Knowledge', score: 0, maxScore: 10 },
        { category: 'System Design', score: 0, maxScore: 10 },
        { category: 'Behavioral', score: 0, maxScore: 10 },
      ];

      this.stats.set({
        totalInterviews,
        totalQuestions,
        avgScore,
        streak: Math.min(totalInterviews, 7),
        recentSessions: (recentSessions as any[]).slice(0, 5),
        weaknessProfile: categories,
      });
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load dashboard data');
    } finally {
      this.loading.set(false);
    }
  }
}
