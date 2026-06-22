import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../services/interview.service';
import { QuestionService } from '../services/question.service';
import { FeedbackService } from '../services/feedback.service';
import { ToastService } from '../services/toast.service';
import { AIAgentService } from '../services/ai-agent.service';
import { ButtonComponent } from '../components/shared/button.component';
import { BadgeComponent } from '../components/shared/badge.component';
import { SkeletonComponent } from '../components/shared/skeleton.component';
import { ErrorStateComponent } from '../components/shared/error-state.component';
import type { Question, FeedbackResult } from '../models/interfaces';

@Component({
  selector: 'app-interview-session-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, BadgeComponent, SkeletonComponent, ErrorStateComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="space-y-6">
          <app-skeleton height="1rem" width="200px" />
          <app-skeleton height="12rem" />
          <app-skeleton height="8rem" />
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()!" [retryable]="true" (retry)="loadSession()" />
      } @else {
        <!-- Session Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{{ sessionData()?.role }} Interview</h1>
            <p class="text-sm text-neutral-500">Question {{ currentIndex() + 1 }} of {{ questions().length }}</p>
          </div>
          <app-badge [text]="currentQuestion()?.category || ''" type="ai" />
        </div>

        @if (currentQuestion()) {
          <!-- Timer -->
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-5 h-5"
                 [class.text-danger-500]="remaining() <= 30 && remaining() > 0"
                 [class.text-warning-500]="remaining() > 30 && remaining() <= 60"
                 [class.text-neutral-500]="remaining() > 60"

                 viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
            </svg>
            <span class="text-sm font-mono font-medium"
                  [class.text-danger-500]="remaining() <= 30"
                  [class.text-warning-500]="remaining() > 30 && remaining() <= 60"
                  [class.text-neutral-600]="remaining() > 60">
              {{ formatTime(remaining()) }}
            </span>
            <!-- Timer bar -->
            <div class="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000"
                   [style.width.%]="timerPercent()"
                   [class.bg-danger-500]="remaining() <= 30"
                   [class.bg-warning-500]="remaining() > 30 && remaining() <= 60"
                   [class.bg-primary-500]="remaining() > 60">
              </div>
            </div>
          </div>

          <!-- Question Card -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
            <div class="flex items-center gap-2 mb-3">
              <app-badge [text]="currentQuestion()!.difficulty" [type]="difficultyBadge(currentQuestion()!.difficulty)" />
            </div>
            <p class="text-lg font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
              {{ currentQuestion()!.content }}
            </p>
            @if (currentQuestion()!.keyPoints) {
              <div class="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <p class="text-xs font-medium text-neutral-500 mb-2">Key Points to Cover</p>
                <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ currentQuestion()!.keyPoints }}</p>
              </div>
            }
          </div>

          <!-- Answer Area (before submit) -->
          @if (!submitted()) {
            <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <textarea
                [(ngModel)]="answer"
                placeholder="Type your answer here..."
                class="w-full min-h-[200px] p-4 text-sm text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
              ></textarea>
              <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <span class="text-xs text-neutral-400">{{ answer().length }} characters</span>
                <div class="flex gap-2">
                  <app-button variant="ghost" size="sm" (click)="skipQuestion()">Skip</app-button>
                  <app-button size="sm" (click)="submitAnswer()" [loading]="submittingAnswer()">Submit</app-button>
                </div>
              </div>
            </div>
          }

          <!-- Feedback Panel (after submit) -->
          @if (submitted() && feedback()) {
            <div class="space-y-6 animate-fade-in">
              <!-- Score -->
              <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <div class="flex items-center gap-6">
                  <div class="relative w-24 h-24">
                    <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-neutral-200 dark:text-neutral-700"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8"
                              stroke-dasharray="251.2"
                              [attr.stroke-dashoffset]="251.2 - (251.2 * feedback()!.overallScore / 10)"
                              [class.text-secondary-500]="feedback()!.overallScore >= 7"
                              [class.text-warning-500]="feedback()!.overallScore >= 4 && feedback()!.overallScore < 7"
                              [class.text-danger-500]="feedback()!.overallScore < 4"
                              class="transition-all duration-1000"/>
                    </svg>
                    <span class="absolute inset-0 flex items-center justify-center text-2xl font-bold"
                          [class.text-secondary-500]="feedback()!.overallScore >= 7"
                          [class.text-warning-500]="feedback()!.overallScore >= 4 && feedback()!.overallScore < 7"
                          [class.text-danger-500]="feedback()!.overallScore < 4">
                      {{ feedback()!.overallScore.toFixed(1) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Overall Score</p>
                    <p class="text-sm text-neutral-500">AI-powered feedback analysis</p>
                  </div>
                </div>
              </div>

              <!-- Dimension Scores -->
              <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Dimension Scores</h3>
                <div class="space-y-3">
                  @for (dim of dimensions(); track dim.key) {
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ dim.label }}</span>
                        <span class="text-sm font-medium" [class.text-secondary-500]="dim.value() >= 7" [class.text-warning-500]="dim.value() >= 4 && dim.value() < 7" [class.text-danger-500]="dim.value() < 4">{{ dim.value().toFixed(1) }}</span>
                      </div>
                      <div class="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                             [style.width.%]="dim.value() * 10"
                             [class.bg-secondary-500]="dim.value() >= 7"
                             [class.bg-warning-500]="dim.value() >= 4 && dim.value() < 7"
                             [class.bg-danger-500]="dim.value() < 4">
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Strengths & Improvements -->
              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                  <h3 class="text-sm font-semibold text-secondary-500 mb-3">Strengths</h3>
                  <ul class="space-y-2">
                    @for (s of strengthsList(); track $index) {
                      <li class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <svg class="w-4 h-4 text-secondary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        {{ s }}
                      </li>
                    }
                  </ul>
                </div>
                <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                  <h3 class="text-sm font-semibold text-warning-500 mb-3">Improvements</h3>
                  <ul class="space-y-2">
                    @for (s of improvementsList(); track $index) {
                      <li class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <svg class="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ s }}
                      </li>
                    }
                  </ul>
                </div>
              </div>

              <!-- Sample Answer -->
              @if (feedback()!.sampleAnswer) {
                <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Sample Answer</h3>
                  <div class="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <p class="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{{ feedback()!.sampleAnswer }}</p>
                  </div>
                </div>
              }

              <!-- Resources -->
              @if (feedback()!.resources) {
                <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Resources</h3>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{{ feedback()!.resources }}</p>
                </div>
              }

              <!-- Next / See Results -->
              <div class="flex justify-center gap-4 pt-4">
                @if (currentIndex() < questions().length - 1) {
                  <app-button (click)="nextQuestion()">Next Question</app-button>
                } @else {
                  <app-button (click)="seeResults()">See Results</app-button>
                }
              </div>
            </div>
          }

          <!-- Analyzing state -->
          @if (submitted() && !feedback() && !feedbackError()) {
            <div class="bg-white dark:bg-neutral-800 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
              <app-skeleton height="6rem" width="6rem" class="mx-auto" />
              <p class="text-sm text-neutral-500 mt-4">AI is analyzing your answer...</p>
            </div>
          }

          @if (feedbackError()) {
          <app-error-state [message]="feedbackError()!" [retryable]="true" (retry)="loadFeedback()" />
          }
        }
      }
    </div>
  `
})
export default class InterviewSessionPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviewService = inject(InterviewService);
  private readonly questionService = inject(QuestionService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly toast = inject(ToastService);

  protected readonly sessionData = signal<any>(null);
  protected readonly questions = signal<Question[]>([]);
  protected readonly currentIndex = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly submittingAnswer = signal(false);
  protected readonly feedback = signal<FeedbackResult | null>(null);
  protected readonly feedbackError = signal<string | null>(null);
  protected readonly answer = signal('');
  protected readonly remaining = signal(180);
  protected readonly analyzing = signal(false);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  protected readonly timerPercent = computed(() => (this.remaining() / 180) * 100);

  protected readonly dimensions = computed(() => {
    const f = this.feedback();
    if (!f) return [];
    return [
      { key: 'structure', label: 'Structure', value: () => f.structureScore },
      { key: 'clarity', label: 'Clarity', value: () => f.clarityScore },
      { key: 'depth', label: 'Depth', value: () => f.depthScore },
      { key: 'examples', label: 'Examples', value: () => f.examplesScore },
      { key: 'keywords', label: 'Keywords', value: () => f.keywordsScore },
    ];
  });

  protected readonly strengthsList = computed(() => {
    const s = this.feedback()?.strengths;
    if (!s) return [];
    return s.split('\n').filter(l => l.trim());
  });

  protected readonly improvementsList = computed(() => {
    const s = this.feedback()?.improvements;
    if (!s) return [];
    return s.split('\n').filter(l => l.trim());
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
      this.sessionData.set(session);

      let questions = session.questions || [];
      if (questions.length === 0) {
        questions = await this.questionService.generate(id);
      }
      this.questions.set(questions);
      this.startTimer();
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load interview session');
    } finally {
      this.loading.set(false);
    }
  }

  protected startTimer(): void {
    this.remaining.set(180);
    this.intervalId = setInterval(() => {
      this.remaining.update(v => {
        if (v <= 0) {
          this.stopTimer();
          this.autoSubmit();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  protected stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  protected async autoSubmit(): Promise<void> {
    if (!this.submitted()) {
      this.toast.show('Time is up! Submitting your answer...', 'warning');
      await this.submitAnswer();
    }
  }

  protected formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  protected difficultyBadge(d: string): 'success' | 'warning' | 'danger' | 'info' {
    if (d === 'Easy') return 'success';
    if (d === 'Medium') return 'warning';
    if (d === 'Hard') return 'danger';
    return 'info';
  }

  protected async submitAnswer(): Promise<void> {
    if (!this.answer().trim()) {
      this.toast.show('Please write an answer before submitting', 'warning');
      return;
    }
    this.submittingAnswer.set(true);
    this.stopTimer();
    try {
      // We don't have a dedicated answer submission endpoint, so we'll analyze directly
      this.submitted.set(true);
      this.analyzing.set(true);
      await this.loadFeedback();
    } catch (err: any) {
      this.feedbackError.set(err?.error?.message || 'Failed to get feedback');
    } finally {
      this.submittingAnswer.set(false);
      this.analyzing.set(false);
    }
  }

  protected async loadFeedback(): Promise<void> {
    try {
      // Simulated feedback for now - in production, this would come from the API
      this.feedback.set({
        id: 0,
        answerId: 0,
        overallScore: 7.5,
        structureScore: 8,
        clarityScore: 7,
        depthScore: 6.5,
        examplesScore: 8,
        keywordsScore: 7.5,
        strengths: 'Good structure\nClear examples\nWell organized',
        improvements: 'Could add more depth\nConsider discussing tradeoffs\nInclude more technical specifics',
        sampleAnswer: 'A strong answer would start by outlining the key concepts, then dive into specifics with concrete examples...',
        resources: 'MDN Web Docs\nSystem Design Interview by Alex Xu\nOfficial Documentation',
        modelUsed: 'gpt-4',
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      this.feedbackError.set(err?.error?.message || 'Failed to load feedback');
    }
  }

  protected skipQuestion(): void {
    this.toast.show('Question skipped', 'info');
    this.nextQuestion();
  }

  protected nextQuestion(): void {
    this.submitted.set(false);
    this.feedback.set(null);
    this.feedbackError.set(null);
    this.answer.set('');
    this.currentIndex.update(i => i + 1);
    this.startTimer();
  }

  protected seeResults(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/interview', id, 'summary']);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
