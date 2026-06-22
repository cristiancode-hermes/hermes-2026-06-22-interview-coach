import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    @for (_ of items; track $index) {
      <div class="animate-pulse bg-neutral-200 dark:bg-neutral-700" 
           [class]="(rounded() ? 'rounded-full ' : 'rounded-lg ') + ' ' + sizeClass()"
           [style.width]="width()"
           [style.height]="height()">
      </div>
    }
  `,
  host: { class: 'block space-y-3' }
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly rounded = input(false);
  readonly count = input(1);

  protected get items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }

  protected sizeClass = () => '';
}
