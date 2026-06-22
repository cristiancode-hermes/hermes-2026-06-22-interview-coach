import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { ButtonComponent } from '../components/shared/button.component';
import { FormInputComponent } from '../components/shared/form-input.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, FormInputComponent],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Profile</h1>

      <div class="space-y-6">
        <!-- Profile Info -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Account Info</h2>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-neutral-500">Email</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ auth.currentUser()?.email }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Name</p>
              <div class="flex items-center gap-2 mt-1">
                <input [(ngModel)]="editName"
                       class="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm" />
                <app-button size="sm" (click)="updateName()" [loading]="savingName()">Save</app-button>
              </div>
              @if (nameError()) {
                <p class="text-sm text-danger-500 mt-1">{{ nameError() }}</p>
              }
            </div>
            <div>
              <p class="text-sm text-neutral-500">Registered</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ auth.currentUser()?.createdAt }}</p>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Change Password</h2>
          <div class="space-y-4">
            <app-form-input
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              [value]="currentPassword()"
              (valueChange)="currentPassword.set($event)"
              [error]="passwordErrors()['current']"
            />
            <app-form-input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              [value]="newPassword()"
              (valueChange)="newPassword.set($event)"
              [error]="passwordErrors()['new']"
            />
            <app-form-input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              [value]="confirmNewPassword()"
              (valueChange)="confirmNewPassword.set($event)"
              [error]="passwordErrors()['confirm']"
            />
            @if (passwordMessage()) {
              <p class="text-sm" [class.text-secondary-500]="!passwordError()" [class.text-danger-500]="passwordError()">
                {{ passwordMessage() }}
              </p>
            }
            <app-button (click)="changePassword()" [loading]="savingPassword()">Update Password</app-button>
          </div>
        </div>

        <!-- Dark Mode -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Dark Mode</h2>
              <p class="text-sm text-neutral-500">Toggle dark mode theme</p>
            </div>
            <button (click)="theme.toggle()"
                    class="relative w-11 h-6 rounded-full transition-colors"
                    [class.bg-primary-500]="theme.isDark()"
                    [class.bg-neutral-300]="!theme.isDark()">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    [class.translate-x-5]="theme.isDark()"></span>
            </button>
          </div>
        </div>

        <!-- Logout -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Sign Out</h2>
              <p class="text-sm text-neutral-500">Sign out of your account</p>
            </div>
            <app-button variant="danger" (click)="confirmLogout()">Logout</app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export default class ProfilePage {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected editName = this.auth.currentUser()?.name || '';
  protected readonly savingName = signal(false);
  protected readonly nameError = signal<string | null>(null);

  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmNewPassword = signal('');
  protected readonly savingPassword = signal(false);
  protected readonly passwordMessage = signal<string | null>(null);
  protected readonly passwordError = signal(false);
  protected readonly passwordErrors = signal<Record<string, string>>({});

  protected async updateName(): Promise<void> {
    if (!this.editName.trim()) {
      this.nameError.set('Name cannot be empty');
      return;
    }
    this.savingName.set(true);
    this.nameError.set(null);
    try {
      await this.auth.updateProfile(this.editName.trim());
      this.toast.show('Name updated!', 'success');
    } catch (err: any) {
      this.nameError.set(err?.error?.message || 'Failed to update name');
    } finally {
      this.savingName.set(false);
    }
  }

  protected async changePassword(): Promise<void> {
    this.passwordMessage.set(null);
    this.passwordErrors.set({});
    this.passwordError.set(false);

    const errors: Record<string, string> = {};
    if (!this.currentPassword()) errors['current'] = 'Current password is required';
    if (!this.newPassword()) errors['new'] = 'New password is required';
    else if (this.newPassword().length < 8) errors['new'] = 'Must be at least 8 characters';
    if (!this.confirmNewPassword()) errors['confirm'] = 'Please confirm your password';
    else if (this.newPassword() !== this.confirmNewPassword()) errors['confirm'] = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      this.passwordErrors.set(errors);
      return;
    }

    this.savingPassword.set(true);
    try {
      await this.auth.changePassword(this.currentPassword(), this.newPassword());
      this.passwordMessage.set('Password updated successfully!');
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmNewPassword.set('');
      this.toast.show('Password changed!', 'success');
    } catch (err: any) {
      this.passwordError.set(true);
      this.passwordMessage.set(err?.error?.message || 'Failed to change password');
    } finally {
      this.savingPassword.set(false);
    }
  }

  protected confirmLogout(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.auth.logout();
    }
  }
}
