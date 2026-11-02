import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_ALERT_DIALOG_IMPORTS } from '@inlaylab/ivorie/alert-dialog';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvCalendar } from '@inlaylab/ivorie/calendar';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover';
import { IvProgress } from '@inlaylab/ivorie/progress';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { IvSlider } from '@inlaylab/ivorie/slider';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group';

/**
 * A small product dashboard built from real components, on a 12-column grid. Container queries,
 * not viewport ones: the canvas is narrower than the window when the control rail is open.
 */
@Component({
  selector: 'docs-playground-preview',
  imports: [
    IV_ALERT_DIALOG_IMPORTS,
    IV_AVATAR_IMPORTS,
    IvBadge,
    IvButton,
    IvCalendar,
    IV_CARD_IMPORTS,
    IvCheckbox,
    IV_DIALOG_IMPORTS,
    IV_FIELD_IMPORTS,
    IV_INPUT_IMPORTS,
    IV_POPOVER_IMPORTS,
    IvProgress,
    IV_RADIO_GROUP_IMPORTS,
    IV_SELECT_IMPORTS,
    IV_SHEET_IMPORTS,
    IvSlider,
    IvSwitch,
    IV_TABLE_IMPORTS,
    IV_TOGGLE_GROUP_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container block' },
  template: `
    <div class="mx-auto grid max-w-[90rem] grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-12">
      <!-- Page title row, like the top of a real app. -->
      <div class="flex flex-wrap items-end justify-between gap-3 @2xl:col-span-2 @5xl:col-span-12">
        <div>
          <h2 class="cn-font-heading text-2xl font-semibold tracking-tight">Acme Cloud</h2>
          <p class="text-muted-foreground text-sm">Production. Last deploy 4 minutes ago.</p>
        </div>
        <div class="flex gap-2">
          <iv-toggle-group type="single" variant="outline" [spacing]="0" value="week" aria-label="Period">
            <button ivToggleGroupItem value="day">Day</button>
            <button ivToggleGroupItem value="week">Week</button>
            <button ivToggleGroupItem value="month">Month</button>
          </iv-toggle-group>
          <button ivButton [ivDialogTrigger]="deploy">Deploy</button>
        </div>
      </div>

      @for (s of stats; track s.label) {
        <iv-card size="sm" class="@5xl:col-span-3">
          <iv-card-header>
            <iv-card-description>{{ s.label }}</iv-card-description>
            <iv-card-title class="text-2xl tabular-nums">{{ s.value }}</iv-card-title>
          </iv-card-header>
          <iv-card-content class="flex items-center gap-2 text-xs">
            <iv-badge [variant]="s.good ? 'secondary' : 'destructive'">{{ s.delta }}</iv-badge>
            <span class="text-muted-foreground">{{ s.note }}</span>
          </iv-card-content>
        </iv-card>
      }

      <iv-card class="@2xl:col-span-2 @5xl:col-span-8">
        <iv-card-header>
          <iv-card-title>Requests</iv-card-title>
          <iv-card-description>Per day, last 14 days. Chart colors come from --chart-1 to --chart-3.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-1 flex-col gap-3">
          <div class="flex h-48 items-end gap-1.5" role="img" aria-label="Requests per day for 14 days, highest on day 10">
            @for (d of traffic; track $index) {
              <div class="flex h-full flex-1 flex-col justify-end gap-0.5">
                <div class="bg-chart-3 rounded-t-[calc(var(--radius)*0.5)]" [style.height.%]="d[2]"></div>
                <div class="bg-chart-2" [style.height.%]="d[1]"></div>
                <div class="bg-chart-1 rounded-b-[calc(var(--radius)*0.5)]" [style.height.%]="d[0]"></div>
              </div>
            }
          </div>
          <div class="text-muted-foreground flex flex-wrap gap-4 text-xs">
            @for (l of legend; track l.label) {
              <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm" [class]="l.color"></span>{{ l.label }}</span>
            }
          </div>
        </iv-card-content>
      </iv-card>

      <iv-card class="@5xl:col-span-4">
        <iv-card-header>
          <iv-card-title>Team</iv-card-title>
          <iv-card-description>Who can change production.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-1 flex-col gap-4">
          @for (m of team; track m.email) {
            <div class="flex items-center gap-3">
              <iv-avatar><iv-avatar-fallback>{{ m.initials }}</iv-avatar-fallback></iv-avatar>
              <div class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-sm font-medium">{{ m.name }}</span>
                <span class="text-muted-foreground truncate text-xs">{{ m.email }}</span>
              </div>
              <iv-select [value]="m.role">
                <iv-select-trigger size="sm" class="w-26" [aria-label]="'Role of ' + m.name" />
                <iv-select-content>
                  <iv-select-item value="owner">Owner</iv-select-item>
                  <iv-select-item value="editor">Editor</iv-select-item>
                  <iv-select-item value="viewer">Viewer</iv-select-item>
                </iv-select-content>
              </iv-select>
            </div>
          }
        </iv-card-content>
        <iv-card-footer class="gap-2">
          <input ivInput type="email" aria-label="Email to invite" placeholder="Email" class="min-w-0 flex-1" />
          <button ivButton variant="secondary">Invite</button>
        </iv-card-footer>
      </iv-card>

      <iv-card class="@2xl:col-span-2 @5xl:col-span-8">
        <iv-card-header>
          <iv-card-title>Recent deploys</iv-card-title>
          <iv-card-description>The last five changes to production.</iv-card-description>
        </iv-card-header>
        <iv-card-content>
          <iv-table>
            <thead ivTableHeader>
              <tr ivTableRow>
                <th ivTableHead>Change</th>
                <th ivTableHead>Branch</th>
                <th ivTableHead>Status</th>
                <th ivTableHead class="text-right">When</th>
              </tr>
            </thead>
            <tbody ivTableBody>
              @for (row of deploys; track row.sha) {
                <tr ivTableRow>
                  <td ivTableCell>
                    <span class="flex flex-col">
                      <span class="font-medium">{{ row.title }}</span>
                      <span class="text-muted-foreground font-mono text-xs">{{ row.sha }}</span>
                    </span>
                  </td>
                  <td ivTableCell><iv-badge variant="outline">{{ row.branch }}</iv-badge></td>
                  <td ivTableCell>
                    <iv-badge [variant]="row.status === 'Failed' ? 'destructive' : row.status === 'Building' ? 'outline' : 'secondary'">{{ row.status }}</iv-badge>
                  </td>
                  <td ivTableCell class="text-muted-foreground text-right">{{ row.when }}</td>
                </tr>
              }
            </tbody>
          </iv-table>
        </iv-card-content>
      </iv-card>

      <iv-card class="@5xl:col-span-4">
        <iv-card-header>
          <iv-card-title>Notifications</iv-card-title>
          <iv-card-description>Choose what reaches your inbox.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-1 flex-col gap-5">
          @for (n of notifications; track n.label) {
            <label class="flex items-center justify-between gap-4 text-sm">
              <span class="flex flex-col gap-0.5">
                {{ n.label }}
                <span class="text-muted-foreground text-xs">{{ n.hint }}</span>
              </span>
              <iv-switch [checked]="n.on" />
            </label>
          }
          <div class="flex flex-col gap-2 border-t pt-4">
            <span class="text-sm" id="pg-digest">Digest size</span>
            <iv-slider aria-labelledby="pg-digest" [value]="[40]" [max]="100" [step]="10" />
          </div>
        </iv-card-content>
      </iv-card>

      <iv-card class="@5xl:col-span-5">
        <iv-card-header>
          <iv-card-title>New project</iv-card-title>
          <iv-card-description>Deploys from your main branch.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-1 flex-col gap-4">
          <iv-field>
            <label ivLabel for="pg-name">Name</label>
            <input ivInput id="pg-name" value="marketing-site" />
          </iv-field>
          <iv-field>
            <label ivLabel for="pg-notes">Notes</label>
            <textarea ivTextarea id="pg-notes" rows="2" placeholder="What is it for?"></textarea>
          </iv-field>
          <div class="flex flex-col gap-2">
            <span class="text-sm font-medium" id="pg-region">Region</span>
            <iv-radio-group value="eu" aria-labelledby="pg-region" class="grid grid-cols-3 gap-2">
              @for (r of regions; track r.value) {
                <label class="has-[[data-checked]]:border-primary flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border p-2.5 text-sm">
                  <iv-radio-group-item [value]="r.value" />
                  {{ r.label }}
                </label>
              }
            </iv-radio-group>
          </div>
          <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Preview deploys for pull requests</label>
        </iv-card-content>
        <iv-card-footer class="justify-end gap-2">
          <button ivButton variant="ghost">Cancel</button>
          <button ivButton>Create project</button>
        </iv-card-footer>
      </iv-card>

      <iv-card class="@5xl:col-span-4">
        <iv-card-header>
          <iv-card-title>Maintenance window</iv-card-title>
          <iv-card-description>Pick a day. We notify the team.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-1 items-center justify-center">
          <iv-calendar [(selected)]="date" class="rounded-[var(--radius)] border" />
        </iv-card-content>
      </iv-card>

      <iv-card class="@2xl:col-span-2 @5xl:col-span-3">
        <iv-card-header>
          <iv-card-title>Storage</iv-card-title>
          <iv-card-description>68 GB of 100 GB used.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-1 flex-col gap-5">
          <iv-progress [value]="68" aria-label="Storage used" />
          <iv-toggle-group type="single" variant="outline" [spacing]="0" value="grid" aria-label="View">
            <button ivToggleGroupItem value="list">List</button>
            <button ivToggleGroupItem value="grid">Grid</button>
          </iv-toggle-group>
          <div class="flex flex-wrap gap-2 border-t pt-4">
            <button ivButton variant="outline" size="sm" [ivSheetTrigger]="sheet">Filters</button>
            <iv-popover>
              <button ivButton ivPopoverTrigger variant="outline" size="sm">Share</button>
              <iv-popover-content class="w-64">
                <iv-popover-header>
                  <iv-popover-title>Share link</iv-popover-title>
                  <iv-popover-description>Anyone with the link can view.</iv-popover-description>
                </iv-popover-header>
                <input ivInput aria-label="Share link" value="acme.dev/s/9f2k" readonly />
              </iv-popover-content>
            </iv-popover>
            <button ivButton variant="destructive" size="sm" [ivAlertDialogTrigger]="confirm">Delete</button>
          </div>
        </iv-card-content>
      </iv-card>
    </div>

    <ng-template #deploy>
      <iv-dialog-header>
        <iv-dialog-title>Deploy to production</iv-dialog-title>
        <iv-dialog-description>main at 4f2a91c. About 2 minutes.</iv-dialog-description>
      </iv-dialog-header>
      <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Run the smoke tests first</label>
      <iv-dialog-footer>
        <button ivButton variant="outline" ivDialogClose>Cancel</button>
        <button ivButton ivDialogClose>Deploy</button>
      </iv-dialog-footer>
    </ng-template>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Filters</iv-sheet-title>
        <iv-sheet-description>Show only what you need.</iv-sheet-description>
      </iv-sheet-header>
      <div class="flex flex-col gap-4 px-4">
        <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Images</label>
        <label class="flex items-center gap-2 text-sm"><iv-checkbox /> Logs</label>
      </div>
    </ng-template>
    <ng-template #confirm>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Delete old builds?</iv-alert-dialog-title>
        <iv-alert-dialog-description>Builds older than 30 days are removed. This cannot be undone.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button ivAlertDialogAction variant="destructive">Delete</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export class PlaygroundPreview {
  protected readonly date = signal<Date | null>(new Date(2026, 10, 14));
  protected readonly stats = [
    { label: 'Deploys today', value: '128', delta: '+12%', note: 'vs. last Monday', good: true },
    { label: 'Median build', value: '1m 42s', delta: '-8s', note: 'faster this week', good: true },
    { label: 'Uptime', value: '99.98%', delta: '30 days', note: 'one short outage', good: true },
    { label: 'Open incidents', value: '2', delta: '1 urgent', note: 'needs an owner', good: false },
  ];
  /** [success, cached, error] heights per day, in % of the bar. */
  protected readonly traffic = [
    [38, 14, 4], [42, 16, 3], [36, 12, 5], [48, 18, 4], [52, 20, 6], [30, 10, 2], [26, 9, 2],
    [44, 17, 4], [56, 22, 5], [64, 24, 7], [58, 21, 5], [40, 15, 3], [34, 13, 3], [50, 19, 4],
  ];
  protected readonly legend = [
    { label: 'Served', color: 'bg-chart-1' },
    { label: 'Cached', color: 'bg-chart-2' },
    { label: 'Errors', color: 'bg-chart-3' },
  ];
  protected readonly team = [
    { name: 'Ada Lovelace', email: 'ada@acme.dev', initials: 'AL', role: 'owner' },
    { name: 'Grace Hopper', email: 'grace@acme.dev', initials: 'GH', role: 'editor' },
    { name: 'Alan Turing', email: 'alan@acme.dev', initials: 'AT', role: 'viewer' },
  ];
  protected readonly deploys = [
    { title: 'Faster image resize', sha: '4f2a91c', branch: 'main', status: 'Building', when: '4 min ago' },
    { title: 'Fix login redirect', sha: '9b7e0d2', branch: 'main', status: 'Ready', when: '1 h ago' },
    { title: 'New pricing page', sha: 'c31f8aa', branch: 'pricing', status: 'Ready', when: '3 h ago' },
    { title: 'Bump Angular to 22.1', sha: '07d5e44', branch: 'deps', status: 'Failed', when: 'Yesterday' },
    { title: 'Cache API responses', sha: 'e8a1b39', branch: 'main', status: 'Ready', when: 'Yesterday' },
  ];
  protected readonly notifications = [
    { label: 'Failed deploys', hint: 'Right away, by email.', on: true },
    { label: 'Weekly summary', hint: 'Every Monday at 9:00.', on: true },
    { label: 'Product news', hint: 'A few times a year.', on: false },
  ];
  protected readonly regions = [
    { value: 'us', label: 'US' },
    { value: 'eu', label: 'EU' },
    { value: 'ap', label: 'Asia' },
  ];
}
