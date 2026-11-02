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
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { IvSlider } from '@inlaylab/ivorie/slider';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group';

/** Real components in small, believable screens. The playground look applies to all of them. */
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
    IV_SELECT_IMPORTS,
    IV_SHEET_IMPORTS,
    IvSlider,
    IvSwitch,
    IV_TABLE_IMPORTS,
    IV_TABS_IMPORTS,
    IV_TOGGLE_GROUP_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Columns, not a grid: cards keep their own height, so the wall packs without gaps.
  host: { class: 'block columns-1 gap-4 md:columns-2 2xl:columns-3 *:mb-4 *:break-inside-avoid' },
  template: `
    <iv-card>
      <iv-card-header>
        <iv-card-title>Sign in</iv-card-title>
        <iv-card-description>Use the email you signed up with.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <iv-field>
          <label ivLabel for="pg-email">Email</label>
          <input ivInput id="pg-email" type="email" autocomplete="off" placeholder="ada@example.com" />
        </iv-field>
        <iv-field>
          <div class="flex items-center justify-between">
            <label ivLabel for="pg-password">Password</label>
            <a href="#" class="text-muted-foreground text-sm underline-offset-4 hover:underline" (click)="$event.preventDefault()">Forgot it?</a>
          </div>
          <input ivInput id="pg-password" type="password" autocomplete="off" />
        </iv-field>
        <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Keep me signed in</label>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2">
        <button ivButton class="w-full">Sign in</button>
        <button ivButton variant="outline" class="w-full">Sign in with a passkey</button>
      </iv-card-footer>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Invoices</iv-card-title>
        <iv-card-description>October. 3 of 4 paid.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-table>
          <thead ivTableHeader>
            <tr ivTableRow>
              <th ivTableHead>Invoice</th>
              <th ivTableHead>Status</th>
              <th ivTableHead class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody ivTableBody>
            @for (row of invoices; track row.id) {
              <tr ivTableRow>
                <td ivTableCell class="font-medium">{{ row.id }}</td>
                <td ivTableCell>
                  <iv-badge [variant]="row.paid ? 'secondary' : 'outline'">{{ row.paid ? 'Paid' : 'Due' }}</iv-badge>
                </td>
                <td ivTableCell class="text-right tabular-nums">{{ row.amount }}</td>
              </tr>
            }
          </tbody>
        </iv-table>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Notifications</iv-card-title>
        <iv-card-description>Choose what reaches your inbox.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-5">
        @for (n of notifications; track n.label) {
          <label class="flex items-center justify-between gap-4 text-sm">
            <span class="flex flex-col gap-0.5">
              {{ n.label }}
              <span class="text-muted-foreground text-xs">{{ n.hint }}</span>
            </span>
            <iv-switch [checked]="n.on" />
          </label>
        }
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Team</iv-card-title>
        <iv-card-description>Invite people and set what they can do.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        @for (m of team; track m.email) {
          <div class="flex items-center gap-3">
            <iv-avatar><iv-avatar-fallback>{{ m.initials }}</iv-avatar-fallback></iv-avatar>
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-sm font-medium">{{ m.name }}</span>
              <span class="text-muted-foreground truncate text-xs">{{ m.email }}</span>
            </div>
            <iv-select [value]="m.role">
              <iv-select-trigger size="sm" class="w-28" [aria-label]="'Role of ' + m.name" />
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
        <input ivInput type="email" aria-label="Email to invite" placeholder="Email" class="flex-1" />
        <button ivButton variant="secondary">Invite</button>
      </iv-card-footer>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Book a call</iv-card-title>
        <iv-card-description>Pick a day. We send the invite.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex justify-center">
        <iv-calendar [(selected)]="date" class="rounded-lg border" />
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Storage</iv-card-title>
        <iv-card-description>68 GB of 100 GB used.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-5">
        <iv-progress [value]="68" aria-label="Storage used" />
        <iv-tabs defaultValue="week">
          <iv-tabs-list>
            <iv-tabs-trigger value="week">Week</iv-tabs-trigger>
            <iv-tabs-trigger value="month">Month</iv-tabs-trigger>
            <iv-tabs-trigger value="year">Year</iv-tabs-trigger>
          </iv-tabs-list>
          <iv-tabs-content value="week" class="text-muted-foreground text-sm">4.2 GB uploaded this week.</iv-tabs-content>
          <iv-tabs-content value="month" class="text-muted-foreground text-sm">18 GB uploaded this month.</iv-tabs-content>
          <iv-tabs-content value="year" class="text-muted-foreground text-sm">68 GB uploaded this year.</iv-tabs-content>
        </iv-tabs>
        <div class="flex flex-col gap-2">
          <span class="text-sm" id="pg-quality">Upload quality</span>
          <iv-slider aria-labelledby="pg-quality" [value]="[60]" [max]="100" [step]="10" />
        </div>
        <iv-toggle-group type="single" variant="outline" [spacing]="0" value="grid" aria-label="View">
          <button ivToggleGroupItem value="list">List</button>
          <button ivToggleGroupItem value="grid">Grid</button>
          <button ivToggleGroupItem value="board">Board</button>
        </iv-toggle-group>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Actions</iv-card-title>
        <iv-card-description>Buttons, badges and the overlays they open.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <button ivButton>Save</button>
          <button ivButton variant="secondary">Draft</button>
          <button ivButton variant="outline">Preview</button>
          <button ivButton variant="ghost">Cancel</button>
          <button ivButton variant="destructive">Delete</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <iv-badge>Live</iv-badge>
          <iv-badge variant="secondary">Beta</iv-badge>
          <iv-badge variant="outline">v1.2</iv-badge>
          <iv-badge variant="destructive">Failed</iv-badge>
        </div>
        <div class="flex flex-wrap gap-2">
          <button ivButton variant="outline" size="sm" [ivDialogTrigger]="dialog">Dialog</button>
          <button ivButton variant="outline" size="sm" [ivSheetTrigger]="sheet">Sheet</button>
          <iv-popover>
            <button ivButton ivPopoverTrigger variant="outline" size="sm">Popover</button>
            <iv-popover-content class="w-64">
              <iv-popover-header>
                <iv-popover-title>Share link</iv-popover-title>
                <iv-popover-description>Anyone with the link can view.</iv-popover-description>
              </iv-popover-header>
              <input ivInput aria-label="Share link" value="ivorie.dev/s/9f2k" readonly />
            </iv-popover-content>
          </iv-popover>
          <button ivButton variant="outline" size="sm" [ivAlertDialogTrigger]="confirm">Alert</button>
        </div>
      </iv-card-content>
    </iv-card>

    <ng-template #dialog>
      <iv-dialog-header>
        <iv-dialog-title>Rename project</iv-dialog-title>
        <iv-dialog-description>The URL changes too.</iv-dialog-description>
      </iv-dialog-header>
      <input ivInput aria-label="Project name" value="Ivorie docs" />
      <iv-dialog-footer>
        <button ivButton variant="outline" ivDialogClose>Cancel</button>
        <button ivButton ivDialogClose>Rename</button>
      </iv-dialog-footer>
    </ng-template>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Filters</iv-sheet-title>
        <iv-sheet-description>Show only what you need.</iv-sheet-description>
      </iv-sheet-header>
      <div class="flex flex-col gap-4 px-4">
        <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Paid</label>
        <label class="flex items-center gap-2 text-sm"><iv-checkbox /> Due</label>
      </div>
    </ng-template>
    <ng-template #confirm>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Delete this invoice?</iv-alert-dialog-title>
        <iv-alert-dialog-description>It cannot be restored.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button ivAlertDialogAction variant="destructive">Delete</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export class PlaygroundPreview {
  protected readonly date = signal<Date | null>(new Date(2026, 10, 12));
  protected readonly invoices = [
    { id: 'INV-1042', paid: true, amount: '$1,250.00' },
    { id: 'INV-1043', paid: true, amount: '$480.00' },
    { id: 'INV-1044', paid: false, amount: '$2,100.00' },
    { id: 'INV-1045', paid: true, amount: '$75.00' },
  ];
  protected readonly notifications = [
    { label: 'Mentions', hint: 'When someone tags you.', on: true },
    { label: 'Weekly summary', hint: 'Every Monday at 9:00.', on: true },
    { label: 'Product news', hint: 'A few times a year.', on: false },
  ];
  protected readonly team = [
    { name: 'Ada Lovelace', email: 'ada@example.com', initials: 'AL', role: 'owner' },
    { name: 'Grace Hopper', email: 'grace@example.com', initials: 'GH', role: 'editor' },
    { name: 'Alan Turing', email: 'alan@example.com', initials: 'AT', role: 'viewer' },
  ];
}
