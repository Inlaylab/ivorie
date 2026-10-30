import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';
import { CopyButton } from './copy-button';

/** How to get a component: copy it with the CLI, or import it from the npm package. */
@Component({
  selector: 'docs-install',
  imports: [IV_TABS_IMPORTS, CopyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'not-prose my-6 block' },
  template: `
    <h2 class="text-foreground mb-3 text-lg font-semibold tracking-[-0.015em]">Installation</h2>
    <iv-tabs defaultValue="cli">
      <iv-tabs-list variant="line">
        <iv-tabs-trigger value="cli">CLI</iv-tabs-trigger>
        <iv-tabs-trigger value="npm">npm</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="cli">
        <div class="bg-muted/60 flex items-center gap-2 rounded-lg border py-1.5 pr-1.5 pl-4">
          <code class="text-foreground flex-1 truncate font-mono text-sm">{{ cli() }}</code>
          <docs-copy-button [text]="cli()" label="Copy command" />
        </div>
      </iv-tabs-content>
      <iv-tabs-content value="npm">
        <div class="bg-muted/60 flex items-center gap-2 rounded-lg border py-1.5 pr-1.5 pl-4">
          <code class="text-foreground flex-1 truncate font-mono text-sm">import {{ '{' }} … {{ '}' }} from '{{ entry() }}'</code>
          <docs-copy-button [text]="entry()" label="Copy import path" />
        </div>
      </iv-tabs-content>
    </iv-tabs>
  `,
})
export class InstallTabs {
  readonly slug = input.required<string>();
  readonly entry = input.required<string>();
  protected readonly cli = computed(() => `npx ivorie add ${this.slug()}`);
}
