import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { FormInputComponent } from '../components/shared/form-input.component';
import { ButtonComponent } from '../components/shared/button.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, FormInputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <div class="text-center mb-8">
            <a routerLink="/" class="inline-flex items-center gap-2 font-bold text-xl text-primary-600 dark:text-primary-400 mb-2">
              <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Interview Coach
            </a>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Create your account</h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Start practicing for your next interview</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <app-form-input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              [value]="name()"
              [error]="fieldErrors()['name']"
            />

            <app-form-input
              label="Email"
              type="email"
              placeholder="you@example.com"
              [value]="email()"
              [error]="fieldErrors()['email']"
            />

            <app-form-input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              [value]="password()"
              [error]="fieldErrors()['password']"
            />

            <app-form-input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              [value]="confirmPassword()"
              [error]="fieldErrors()['confirmPassword']"
            />

            @if (errorMessage()) {
              <div class="p-3 rounded-lg bg-danger-50 dark:bg-red-900/20 text-danger-600 dark:text-red-400 text-sm">
                {{ errorMessage() }}
              </div>
            }

            <app-button
              type="submit"
              variant="primary"
              [loading]="loading()"
              class="w-full"
            >
              Create Account
            </app-button>
          </form>

          <p class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export default class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const errors: Record<string, string> = {};
    if (!this.name().trim()) errors['name'] = 'Name is required';
    if (!this.email().trim()) errors['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())) errors['email'] = 'Invalid email format';
    if (!this.password()) errors['password'] = 'Password is required';
    else if (this.password().length < 8) errors['password'] = 'Password must be at least 8 characters';
    if (!this.confirmPassword()) errors['confirmPassword'] = 'Please confirm your password';
    else if (this.password() !== this.confirmPassword()) errors['confirmPassword'] = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      this.fieldErrors.set(errors);
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.register(this.email(), this.password(), this.name().trim());
      this.toast.show('Account created successfully!', 'success');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Registration failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
