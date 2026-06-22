import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../services/interview.service';
import { ToastService } from '../services/toast.service';
import { ButtonComponent } from '../components/shared/button.component';
import { BadgeComponent } from '../components/shared/badge.component';
import { CardComponent } from '../components/shared/card.component';

const ROLES = ['Frontend', 'Backend', 'Fullstack', 'Data', 'DevOps'] as const;
const SENIORITIES = ['Junior', 'Mid', 'Senior', 'Lead'] as const;
const TYPES = ['Technical', 'Behavioral', 'Mixed'] as const;
const TECH_TAGS = ['React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'GraphQL', 'TypeScript', 'CSS'];

@Component({
  selector: 'app-new-interview-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, BadgeComponent, CardComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">New Interview</h1>

      <!-- Stepper -->
      <div class="flex items-center gap-2 mb-8">
        @for (step of steps; track step; let i = $index) {
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                 [class.bg-primary-500]="currentStep() >= i"
                 [class.bg-primary-500]="currentStep() === i"
                 [class.text-white]="currentStep() >= i"
                 [class.bg-neutral-200]="currentStep() < i"
                 [class.text-neutral-500]="currentStep() < i">
              @if (currentStep() > i) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              } @else {
                {{ i + 1 }}
              }
            </div>
            <span class="text-sm font-medium" [class.text-primary-600]="currentStep() >= i" [class.text-neutral-400]="currentStep() < i">{{ step }}</span>
            @if (i < steps.length - 1) {
              <div class="w-8 h-0.5 mx-1" [class.bg-primary-500]="currentStep() > i" [class.bg-neutral-200]="currentStep() <= i"></div>
            }
          </div>
        }
      </div>

      <!-- Step 1: Role -->
      @if (currentStep() === 0) {
        <app-card>
          <div card-header>
            <h2 class="text-lg font-semibold">Select Role</h2>
          </div>
          <div card-body class="p-6">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              @for (role of roles; track role) {
                <button (click)="formData.role = role"
                        class="p-4 rounded-xl border-2 text-center transition-all"
                        [class.border-primary-500]="formData.role === role"
                        [class.bg-primary-50]="formData.role === role"
                        [class.border-neutral-200]="formData.role !== role"
                        [class.hover:border-primary-300]="formData.role !== role">
                  <span class="block text-sm font-medium">{{ role }}</span>
                </button>
              }
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Seniority</label>
              <select [(ngModel)]="formData.seniority" class="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm">
                <option value="">Select seniority</option>
                @for (sen of seniorities; track sen) {
                  <option [value]="sen">{{ sen }}</option>
                }
              </select>
            </div>
          </div>
          <div card-footer>
            <div class="flex justify-end">
              <app-button (click)="currentStep.set(1)" [disabled]="!formData.role || !formData.seniority">Next</app-button>
            </div>
          </div>
        </app-card>
      }

      <!-- Step 2: Type & Technologies -->
      @if (currentStep() === 1) {
        <app-card>
          <div card-header>
            <h2 class="text-lg font-semibold">Interview Type & Technologies</h2>
          </div>
          <div card-body class="p-6">
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Type</label>
            <div class="flex gap-3 mb-6">
              @for (type of types; track type) {
                <button (click)="formData.type = type"
                        class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all"
                        [class.border-primary-500]="formData.type === type"
                        [class.bg-primary-50]="formData.type === type"
                        [class.border-neutral-200]="formData.type !== type">
                  {{ type }}
                </button>
              }
            </div>

            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Technologies (select relevant)</label>
            <div class="flex flex-wrap gap-2">
              @for (tech of techTags; track tech) {
                <button (click)="toggleTech(tech)"
                        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                        [class.bg-primary-500]="selectedTechs().has(tech)"
                        [class.text-white]="selectedTechs().has(tech)"
                        [class.border-primary-500]="selectedTechs().has(tech)"
                        [class.bg-white]="!selectedTechs().has(tech)"
                        [class.border-neutral-300]="!selectedTechs().has(tech)"
                        [class.text-neutral-700]="!selectedTechs().has(tech)">
                  {{ tech }}
                </button>
              }
            </div>
          </div>
          <div card-footer>
            <div class="flex justify-between">
              <app-button variant="ghost" (click)="currentStep.set(0)">Back</app-button>
              <app-button (click)="currentStep.set(2)" [disabled]="!formData.type">Next</app-button>
            </div>
          </div>
        </app-card>
      }

      <!-- Step 3: Company & Adaptive -->
      @if (currentStep() === 2) {
        <app-card>
          <div card-header>
            <h2 class="text-lg font-semibold">Company & Settings</h2>
          </div>
          <div card-body class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Target Company (optional)</label>
              <input [(ngModel)]="formData.targetCompany" placeholder="e.g., Google, Meta, Stripe" class="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm" />
            </div>
            <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Adaptive Mode</p>
                <p class="text-xs text-neutral-500">Questions adjust difficulty based on your answers</p>
              </div>
              <button (click)="formData.adaptiveMode = !formData.adaptiveMode"
                      class="relative w-11 h-6 rounded-full transition-colors"
                      [class.bg-primary-500]="formData.adaptiveMode"
                      [class.bg-neutral-300]="!formData.adaptiveMode">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      [class.translate-x-5]="formData.adaptiveMode"></span>
              </button>
            </div>
          </div>
          <div card-footer>
            <div class="flex justify-between">
              <app-button variant="ghost" (click)="currentStep.set(1)">Back</app-button>
              <app-button (click)="currentStep.set(3)">Review</app-button>
            </div>
          </div>
        </app-card>
      }

      <!-- Step 4: Confirm -->
      @if (currentStep() === 3) {
        <app-card>
          <div card-header>
            <h2 class="text-lg font-semibold">Review & Start</h2>
          </div>
          <div card-body class="p-6 space-y-3">
            <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
              <span class="text-sm text-neutral-500">Role</span>
              <span class="text-sm font-medium">{{ formData.role }} · {{ formData.seniority }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
              <span class="text-sm text-neutral-500">Type</span>
              <span class="text-sm font-medium">{{ formData.type }}</span>
            </div>
            @if (formData.technologies) {
              <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                <span class="text-sm text-neutral-500">Technologies</span>
                <span class="text-sm font-medium">{{ formData.technologies }}</span>
              </div>
            }
            @if (formData.targetCompany) {
              <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                <span class="text-sm text-neutral-500">Target Company</span>
                <span class="text-sm font-medium">{{ formData.targetCompany }}</span>
              </div>
            }
            <div class="flex justify-between py-2">
              <span class="text-sm text-neutral-500">Adaptive Mode</span>
              <app-badge [text]="formData.adaptiveMode ? 'Enabled' : 'Disabled'" [type]="formData.adaptiveMode ? 'success' : 'info'" />
            </div>
          </div>
          <div card-footer>
            <div class="flex justify-between">
              <app-button variant="ghost" (click)="currentStep.set(2)">Back</app-button>
              <app-button (click)="startInterview()" [loading]="submitting()" variant="primary">Start Interview</app-button>
            </div>
          </div>
        </app-card>
      }

      @if (errorMessage()) {
        <div class="mt-4 p-3 rounded-lg bg-danger-50 dark:bg-red-900/20 text-danger-600 dark:text-red-400 text-sm">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `
})
export default class NewInterviewPage {
  private readonly interviewService = inject(InterviewService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly steps = ['Role', 'Type', 'Settings', 'Confirm'];
  protected readonly roles = ROLES;
  protected readonly seniorities = SENIORITIES;
  protected readonly types = TYPES;
  protected readonly techTags = TECH_TAGS;

  protected readonly currentStep = signal(0);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedTechs = signal<Set<string>>(new Set());

  protected formData = {
    role: '',
    seniority: '',
    type: '',
    technologies: '',
    targetCompany: '',
    adaptiveMode: false,
  };

  protected toggleTech(tech: string): void {
    this.selectedTechs.update(s => {
      const next = new Set(s);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
    this.formData.technologies = Array.from(this.selectedTechs()).join(',');
  }

  protected async startInterview(): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      const session = await this.interviewService.create(this.formData);
      this.toast.show('Interview created!', 'success');
      this.router.navigate(['/interview', session.id]);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Failed to create interview');
    } finally {
      this.submitting.set(false);
    }
  }
}
