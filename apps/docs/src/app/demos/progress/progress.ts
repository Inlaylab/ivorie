import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvProgress } from '@inlaylab/ivorie/progress';

@Component({
  selector: 'demo-progress',
  imports: [IvProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid w-full max-w-sm gap-5">
      @for (file of files; track file.name) {
        <li class="grid gap-2">
          <div class="flex items-baseline justify-between gap-4 text-sm">
            <span class="truncate font-medium">{{ file.name }}</span>
            <span class="text-muted-foreground shrink-0 tabular-nums">
              {{ file.value === 100 ? 'Done' : file.value === 0 ? 'Waiting' : file.value + '%' }}
            </span>
          </div>
          <iv-progress [value]="file.value" [attr.aria-label]="'Upload ' + file.name" />
        </li>
      }
    </ul>
  `,
})
export default class ProgressDemo {
  protected readonly files = [
    { name: 'brand-guide.pdf', value: 100 },
    { name: 'launch-video.mp4', value: 60 },
    { name: 'product-shots.zip', value: 25 },
    { name: 'release-notes.md', value: 0 },
  ];
}
