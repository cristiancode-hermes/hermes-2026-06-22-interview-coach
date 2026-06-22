import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <ng-content select="[card-header]" />
      </div>
      <ng-content select="[card-body]" />
      <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
        <ng-content select="[card-footer]" />
      </div>
    </div>
  `,
  host: { class: 'block' }
})
export class CardComponent {}
