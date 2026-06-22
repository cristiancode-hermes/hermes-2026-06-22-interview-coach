import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-1">
      @if (label()) {
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {{ label() }}
        </label>
      }
      <div class="relative">
        @if (icon()) {
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400" [innerHTML]="icon()"></div>
        }
        <input
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value()"
          (input)="onInput($event)"
          class="block w-full rounded-lg border bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          [class]="(icon() ? 'pl-10 ' : '') + (error() ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300 dark:border-neutral-600')"
        />
      </div>
      @if (error()) {
        <p class="text-sm text-danger-500">{{ error() }}</p>
      }
    </div>
  `
})
export class FormInputComponent {
  readonly label = input<string>('');
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input<string>('');
  readonly error = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly value = model<string>('');

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
