import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 transition-opacity" (click)="close.emit()"></div>
        <div class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full animate-slide-up"
             [class]="maxWidthClass()">
          @if (title()) {
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ title() }}</h3>
              <button (click)="close.emit()" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          }
          <div class="px-6 py-4">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly close = output<void>();

  protected readonly maxWidthClass = computed(() => {
    const sizes: Record<string, string> = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
    };
    return sizes[this.size()] || sizes['md'];
  });
}
