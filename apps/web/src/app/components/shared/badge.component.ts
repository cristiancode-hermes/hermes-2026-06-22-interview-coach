import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="badgeClass()">
      {{ text() }}
    </span>
  `
})
export class BadgeComponent {
  readonly text = input.required<string>();
  readonly type = input<'primary' | 'ai' | 'success' | 'danger' | 'warning' | 'info'>('primary');

  protected readonly badgeClass = computed(() => {
    const type = this.type();
    const classes: Record<string, string> = {
      'primary': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      'ai': 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
      'success': 'bg-secondary-100 text-secondary-700 dark:bg-green-900/30 dark:text-green-300',
      'danger': 'bg-danger-50 text-danger-600 dark:bg-red-900/30 dark:text-red-300',
      'warning': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'info': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return classes[type] || classes['primary'];
  });
}
