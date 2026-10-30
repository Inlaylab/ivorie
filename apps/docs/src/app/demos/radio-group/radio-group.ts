import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group';

@Component({
  selector: 'demo-radio-group',
  imports: [IV_RADIO_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-radio-group [(value)]="plan" class="w-full max-w-sm">
      @for (p of plans; track p.value) {
        <label
          class="has-[[data-checked]]:border-primary has-[[data-checked]]:ring-primary/20 flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[[data-checked]]:ring-[3px]"
        >
          <iv-radio-group-item [value]="p.value" class="mt-1" />
          <span class="grid flex-1 gap-1">
            <span class="flex items-baseline justify-between gap-2">
              <span class="font-medium">{{ p.name }}</span>
              <span class="text-muted-foreground text-sm">{{ p.price }}</span>
            </span>
            <span class="text-muted-foreground text-sm">{{ p.description }}</span>
          </span>
        </label>
      }
    </iv-radio-group>
  `,
})
export default class RadioGroupDemo {
  protected readonly plans = [
    { value: 'starter', name: 'Starter', price: '$0', description: 'For trying things out. Up to 3 projects.' },
    { value: 'pro', name: 'Pro', price: '$12/mo', description: 'For small teams. Unlimited projects, priority support.' },
    { value: 'team', name: 'Team', price: '$49/mo', description: 'For growing teams. Shared workspaces and roles.' },
  ];
  protected readonly plan = signal<string | null>('pro');
}
