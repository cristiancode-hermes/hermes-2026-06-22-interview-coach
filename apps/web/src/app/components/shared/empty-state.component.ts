import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      @if (icon()) {
        <div class="w-16 h-16 mb-4 text-neutral-300 dark:text-neutral-500" [innerHTML]="icon()"></div>
      }
      @if (title()) {
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{{ title() }}</h3>
      }
      @if (subtitle()) {
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">{{ subtitle() }}</p>
      }
      @if (actionText() && actionLink()) {
        <a [routerLink]="actionLink()" class="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          {{ actionText() }}
        </a>
      }
      @if (actionText() && !actionLink()) {
        <button (click)="action.emit()" class="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          {{ actionText() }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  readonly icon = input<string>('');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly actionText = input<string>('');
  readonly actionLink = input<string>('');
  readonly action = output<void>();
}
