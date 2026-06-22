import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 mb-4 text-danger-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd"/>
        </svg>
      </div>
      <p class="text-neutral-700 dark:text-neutral-300 mb-4">{{ message() }}</p>
      @if (retryable()) {
        <button (click)="retry.emit()" class="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          Try Again
        </button>
      }
    </div>
  `
})
export class ErrorStateComponent {
  readonly message = input<string>('Something went wrong');
  readonly retryable = input(false);
  readonly retry = output<void>();
}
