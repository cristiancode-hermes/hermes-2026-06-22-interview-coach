import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [disabled]="disabled() || loading()"
      [attr.type]="type()"
      class="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      [class]="sizeClasses() + ' ' + variantClasses()"
      (click)="clicked.emit()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content />
    </button>
  `,
  host: { class: 'inline-block' }
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly clicked = output<void>();

  protected readonly sizeClasses = computed(() => {
    const sizes: Record<string, string> = {
      'sm': 'px-3 py-1.5 text-sm',
      'md': 'px-4 py-2 text-sm',
      'lg': 'px-6 py-3 text-base',
    };
    return sizes[this.size()] || sizes['md'];
  });

  protected readonly variantClasses = computed(() => {
    const variants: Record<string, string> = {
      'primary': 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      'secondary': 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 focus:ring-neutral-500',
      'danger': 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500',
      'ghost': 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-500',
    };
    return variants[this.variant()] || variants['primary'];
  });
}
