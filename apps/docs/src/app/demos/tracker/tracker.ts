import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvTracker } from '@inlaylab/ivorie/tracker';

@Component({
  selector: 'demo-tracker',
  imports: [IvTracker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-md gap-2 pt-10">
      <div class="flex items-baseline justify-between text-sm">
        <span class="font-medium">api.acme.dev</span>
        <span class="text-muted-foreground">99.6% uptime</span>
      </div>
      <iv-tracker [data]="days" label="API uptime, last 30 days" />
      <div class="text-muted-foreground flex justify-between text-xs"><span>30 days ago</span><span>Today</span></div>
    </div>
  `,
})
export default class TrackerDemo {
  protected readonly days = Array.from({ length: 30 }, (_, i) => {
    const status = i === 11 ? 'error' : i === 12 || i === 23 ? 'warn' : 'ok';
    const words = { ok: 'operational', warn: 'degraded', error: 'outage' } as const;
    return { status, tooltip: `Nov ${i + 1}: ${words[status]}` } as const;
  });
}
