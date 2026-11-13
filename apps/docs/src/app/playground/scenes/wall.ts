import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { IV_ACCORDION_IMPORTS } from '@inlaylab/ivorie/accordion';
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert';
import { IV_ALERT_DIALOG_IMPORTS } from '@inlaylab/ivorie/alert-dialog';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IV_BREADCRUMB_IMPORTS } from '@inlaylab/ivorie/breadcrumb';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvCalendar } from '@inlaylab/ivorie/calendar';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS, type IvChartConfig } from '@inlaylab/ivorie/chart';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';
import { IV_EMPTY_IMPORTS } from '@inlaylab/ivorie/empty';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IvIcon } from '@inlaylab/ivorie/icon';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_INPUT_OTP_IMPORTS } from '@inlaylab/ivorie/input-otp';
import { IV_ITEM_IMPORTS } from '@inlaylab/ivorie/item';
import { IV_KBD_IMPORTS } from '@inlaylab/ivorie/kbd';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';
import { IV_PAGINATION_IMPORTS } from '@inlaylab/ivorie/pagination';
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover';
import { IvProgress } from '@inlaylab/ivorie/progress';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IvSeparator } from '@inlaylab/ivorie/separator';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { IvSlider } from '@inlaylab/ivorie/slider';
import { IvSpinner } from '@inlaylab/ivorie/spinner';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group';
import { FONTS } from '../../../generated/looks';
import { STYLES } from '../../shell/appearance-options';
import { PlaygroundLook } from '../playground-look';

const fontTitle = (name: string) => FONTS.find((f) => f.name === name)?.title ?? 'System';

const MEMBERS = [
  { name: 'Ada Lovelace', email: 'ada@acme.dev', status: 'Active' },
  { name: 'Grace Hopper', email: 'grace@acme.dev', status: 'Active' },
  { name: 'Alan Turing', email: 'alan@acme.dev', status: 'Invited' },
  { name: 'Katherine Johnson', email: 'katherine@acme.dev', status: 'Active' },
  { name: 'Edsger Dijkstra', email: 'edsger@acme.dev', status: 'Suspended' },
  { name: 'Barbara Liskov', email: 'barbara@acme.dev', status: 'Active' },
  { name: 'Donald Knuth', email: 'donald@acme.dev', status: 'Active' },
].map((m) => ({ ...m, initials: m.name.split(' ').map((w) => w[0]).join('') }));
const PAGE_SIZE = 3;

/**
 * Every component worth previewing, as a wall of small working cards: the home page shows it, and it
 * is the playground's preview. Dialogs, popovers, menus and the sheet open in the overlay container.
 * Columns: 1, then 2 from md, 3 from lg, 4 from xl. Cards keep their order down each column.
 * `prefix` keeps ids unique when the wall is on a page with other forms.
 */
@Component({
  selector: 'docs-scene-wall',
  imports: [
    IV_ACCORDION_IMPORTS,
    IV_ALERT_IMPORTS,
    IV_ALERT_DIALOG_IMPORTS,
    IV_AVATAR_IMPORTS,
    IvBadge,
    IV_BREADCRUMB_IMPORTS,
    IvButton,
    IvCalendar,
    IV_CARD_IMPORTS,
    IV_CHART_IMPORTS,
    IvCheckbox,
    IV_COMMAND_IMPORTS,
    IV_DIALOG_IMPORTS,
    IV_DROPDOWN_MENU_IMPORTS,
    IV_EMPTY_IMPORTS,
    IV_FIELD_IMPORTS,
    IvIcon,
    IV_INPUT_IMPORTS,
    IV_INPUT_OTP_IMPORTS,
    IV_ITEM_IMPORTS,
    IV_KBD_IMPORTS,
    IV_NATIVE_SELECT_IMPORTS,
    IV_PAGINATION_IMPORTS,
    IV_POPOVER_IMPORTS,
    IvProgress,
    IV_RADIO_GROUP_IMPORTS,
    IV_SELECT_IMPORTS,
    IvSeparator,
    IV_SHEET_IMPORTS,
    IvSlider,
    IvSpinner,
    IvSwitch,
    IV_TABLE_IMPORTS,
    IV_TABS_IMPORTS,
    IV_TOGGLE_GROUP_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block columns-1 gap-4 md:columns-2 lg:columns-3 xl:columns-4 *:mb-4 *:break-inside-avoid' },
  template: `
    <!-- The look itself first: its fonts and its colors. -->
    <iv-card data-testid="wall-specimen">
      <iv-card-header>
        <iv-card-title class="text-2xl">{{ styleTitle() }}, {{ fontTitle() }}</iv-card-title>
        <iv-card-description>Designers love packing quirky glyphs into test phrases. This one previews the type.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <ul class="grid grid-cols-6 gap-x-2 gap-y-3" aria-label="Theme colors">
          @for (t of tokens; track t) {
            <li class="flex min-w-0 flex-col items-center gap-1.5">
              <span class="aspect-square w-full rounded-[calc(var(--radius)*1.2)] ring-1 ring-black/10 dark:ring-white/15" [style.background]="'var(' + t + ')'"></span>
              <span class="text-muted-foreground w-full truncate text-center font-mono text-[0.625rem]" [title]="t">{{ t }}</span>
            </li>
          }
        </ul>
      </iv-card-content>
    </iv-card>

    <!-- The everyday controls in one place: buttons, fields, badges, toggles, keys. -->
    <iv-card data-testid="wall-controls">
      <iv-card-content class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <button ivButton size="sm">Button</button>
          <button ivButton size="sm" variant="secondary">Secondary</button>
          <button ivButton size="sm" variant="outline">Outline</button>
          <button ivButton size="sm" variant="ghost">Ghost</button>
        </div>
        <input ivInput type="search" placeholder="Search" aria-label="Search" />
        <textarea ivTextarea rows="2" placeholder="Message" aria-label="Message"></textarea>
        <div class="flex flex-wrap items-center gap-2">
          <iv-badge>Badge</iv-badge>
          <iv-badge variant="secondary">Secondary</iv-badge>
          <iv-badge variant="outline">Outline</iv-badge>
          <span class="flex-1"></span>
          <iv-checkbox [checked]="true" aria-label="Done" />
          <iv-switch [checked]="true" aria-label="On" />
        </div>
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          Search anywhere <kbd ivKbdGroup><kbd ivKbd>⌘</kbd><kbd ivKbd>K</kbd></kbd>
        </div>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-description>Heading {{ headingTitle() }}, body {{ fontTitle() }}</iv-card-description>
        <iv-card-title class="text-2xl leading-tight text-balance">Designing with rhythm and hierarchy.</iv-card-title>
      </iv-card-header>
      <iv-card-content class="text-muted-foreground flex flex-col gap-3 text-sm leading-relaxed text-pretty">
        <p>A strong body style keeps long text readable and balances the weight of the headings.</p>
        <p>Steady spacing and line height let readers scan a paragraph without it feeling dense.</p>
      </iv-card-content>
      <iv-card-footer>
        <button ivButton variant="outline" class="w-full">Share feedback</button>
      </iv-card-footer>
    </iv-card>

    <!-- Dashboard -->
    <iv-card>
      <iv-card-header>
        <iv-card-title>Acme Cloud</iv-card-title>
        <iv-card-description>Production. Last deploy 4 minutes ago.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <iv-toggle-group type="single" variant="outline" [spacing]="0" value="week" aria-label="Period" class="self-start">
          <button ivToggleGroupItem value="day">Day</button>
          <button ivToggleGroupItem value="week">Week</button>
          <button ivToggleGroupItem value="month">Month</button>
        </iv-toggle-group>
        <div class="grid grid-cols-2 gap-3">
          @for (s of stats; track s.label) {
            <div class="flex flex-col gap-1 rounded-[var(--radius)] border p-3">
              <span class="text-muted-foreground text-xs">{{ s.label }}</span>
              <span class="text-xl font-semibold tabular-nums">{{ s.value }}</span>
              <iv-badge [variant]="s.good ? 'secondary' : 'destructive'" class="self-start"
                ><svg [ivIcon]="s.up ? icons().trendingUp : icons().trendingDown"></svg>{{ s.delta }}</iv-badge
              >
            </div>
          }
        </div>
      </iv-card-content>
      <iv-card-footer>
        <button ivButton class="w-full" [ivDialogTrigger]="deploy"><svg [ivIcon]="icons().cloudUpload"></svg>Deploy</button>
      </iv-card-footer>
    </iv-card>

    <!-- A command menu: type to filter, arrows to move. -->
    <iv-command class="bg-card rounded-xl border shadow-sm" data-testid="wall-command">
      <iv-command-input placeholder="Type a command or search..." />
      <iv-command-list>
        <iv-command-empty>No results found.</iv-command-empty>
        <iv-command-group heading="Suggestions">
          <iv-command-item><svg [ivIcon]="icons().clock"></svg>Schedule a deploy</iv-command-item>
          <iv-command-item><svg [ivIcon]="icons().mail"></svg>Invite by email</iv-command-item>
          <iv-command-item><svg [ivIcon]="icons().folderPlus"></svg>New project</iv-command-item>
        </iv-command-group>
        <iv-command-separator />
        <iv-command-group heading="Settings">
          <iv-command-item><svg [ivIcon]="icons().users"></svg>Profile<iv-command-shortcut>⌘P</iv-command-shortcut></iv-command-item>
          <iv-command-item><svg [ivIcon]="icons().creditCard"></svg>Billing<iv-command-shortcut>⌘B</iv-command-shortcut></iv-command-item>
          <iv-command-item><svg [ivIcon]="icons().settings"></svg>Settings<iv-command-shortcut>⌘S</iv-command-shortcut></iv-command-item>
        </iv-command-group>
      </iv-command-list>
    </iv-command>

    <!-- Builds: where you are, then running and finished builds in tabs. -->
    <iv-card>
      <iv-card-header class="gap-2">
        <nav ivBreadcrumb aria-label="Project">
          <ol ivBreadcrumbList>
            <li ivBreadcrumbItem><a ivBreadcrumbLink href="#" (click)="$event.preventDefault()">acme</a></li>
            <li ivBreadcrumbSeparator></li>
            <li ivBreadcrumbItem><a ivBreadcrumbLink href="#" (click)="$event.preventDefault()">web</a></li>
            <li ivBreadcrumbSeparator></li>
            <li ivBreadcrumbItem><span ivBreadcrumbPage>Builds</span></li>
          </ol>
        </nav>
        <iv-card-title>Builds</iv-card-title>
      </iv-card-header>
      <iv-card-content>
        <iv-tabs defaultValue="running">
          <iv-tabs-list class="w-full">
            <iv-tabs-trigger value="running">Running</iv-tabs-trigger>
            <iv-tabs-trigger value="finished">Finished</iv-tabs-trigger>
          </iv-tabs-list>
          @for (tab of builds; track tab.value) {
            <iv-tabs-content [value]="tab.value">
              <iv-item-group class="gap-2">
                @for (b of tab.items; track b.title) {
                  <iv-item variant="outline" size="sm">
                    <iv-item-media variant="icon">
                      @if (tab.value === 'running') {
                        <iv-spinner />
                      } @else {
                        <svg [ivIcon]="icons().check"></svg>
                      }
                    </iv-item-media>
                    <iv-item-content>
                      <iv-item-title>{{ b.title }}</iv-item-title>
                      <p ivItemDescription>{{ b.detail }}</p>
                    </iv-item-content>
                  </iv-item>
                }
              </iv-item-group>
            </iv-tabs-content>
          }
        </iv-tabs>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Release checklist</iv-card-title>
        <iv-card-description>Ships when every gate is green.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <iv-progress [value]="done() * 25" aria-label="Release progress" />
        @for (gate of gates; track gate.label; let i = $index) {
          <label class="flex items-center justify-between gap-4 text-sm">
            <span class="flex items-center gap-2">
              {{ gate.label }}
              @if (gate.new) {
                <iv-badge variant="secondary">new</iv-badge>
              }
            </span>
            <iv-switch [checked]="i < done()" (checkedChange)="toggle(i, $event)" />
          </label>
        }
      </iv-card-content>
      <iv-card-footer class="justify-end gap-2">
        <button ivButton variant="ghost" size="sm" (click)="done.set(0)">Reset</button>
        <button ivButton size="sm" [disabled]="done() < gates.length">Publish</button>
      </iv-card-footer>
    </iv-card>

    <!-- Sign in -->
    <iv-card>
      <iv-card-header>
        <iv-card-title>Sign in</iv-card-title>
        <iv-card-description>Use your work email.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-field-group>
          <iv-field>
            <label ivLabel [for]="prefix() + '-email'">Email</label>
            <input ivInput [id]="prefix() + '-email'" type="email" autocomplete="email" placeholder="ada@example.com" />
          </iv-field>
          <iv-field>
            <label ivLabel [for]="prefix() + '-password'">Password</label>
            <input ivInput [id]="prefix() + '-password'" type="password" autocomplete="current-password" />
          </iv-field>
          <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Keep me signed in</label>
        </iv-field-group>
      </iv-card-content>
      <iv-card-footer class="flex-col gap-2">
        <button ivButton class="w-full"><svg [ivIcon]="icons().mail"></svg>Sign in</button>
        <button ivButton variant="outline" class="w-full">Continue with GitHub</button>
      </iv-card-footer>
    </iv-card>

    <!-- Team -->
    <iv-card>
      <iv-card-header>
        <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().users" class="text-muted-foreground size-4"></svg>Members</iv-card-title>
        <iv-card-description>{{ members.length }} people in Acme.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-3">
        <input ivInput type="search" aria-label="Search members" placeholder="Search by name" [value]="query()" (input)="search($any($event.target).value)" />
        <iv-table>
          <!-- Headers for screen readers; the card shows the columns plainly. -->
          <thead class="sr-only">
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody ivTableBody>
            @for (m of rows(); track m.email) {
              <tr ivTableRow>
                <td ivTableCell class="pl-0">
                  <span class="flex items-center gap-2">
                    <iv-avatar size="sm" class="shrink-0"><iv-avatar-fallback>{{ m.initials }}</iv-avatar-fallback></iv-avatar>
                    <span class="truncate font-medium">{{ m.name }}</span>
                  </span>
                </td>
                <td ivTableCell>
                  <iv-badge [variant]="m.status === 'Suspended' ? 'destructive' : m.status === 'Invited' ? 'outline' : 'secondary'">{{ m.status }}</iv-badge>
                </td>
                <td ivTableCell class="pr-0 text-right">
                  <iv-dropdown-menu>
                    <button ivButton ivDropdownMenuTrigger variant="ghost" size="icon-sm" [attr.aria-label]="'Actions for ' + m.name">
                      <svg ivIcon="ellipsis"></svg>
                    </button>
                    <iv-dropdown-menu-content align="end">
                      <iv-dropdown-menu-item>Change role</iv-dropdown-menu-item>
                      <iv-dropdown-menu-item>Resend invite</iv-dropdown-menu-item>
                      <iv-dropdown-menu-separator />
                      <iv-dropdown-menu-item variant="destructive">Remove</iv-dropdown-menu-item>
                    </iv-dropdown-menu-content>
                  </iv-dropdown-menu>
                </td>
              </tr>
            } @empty {
              <tr ivTableRow>
                <td ivTableCell colspan="3" class="text-muted-foreground py-6 text-center">No member matches "{{ query() }}".</td>
              </tr>
            }
          </tbody>
        </iv-table>
      </iv-card-content>
      <iv-card-footer class="justify-center">
        <nav ivPagination class="mx-0 w-auto" [attr.aria-label]="'Members pages'">
          <ul ivPaginationContent>
            <li ivPaginationItem><a ivPaginationPrevious href="#" text="" (click)="go(page() - 1, $event)"></a></li>
            @for (p of pages(); track p) {
              <li ivPaginationItem>
                <a ivPaginationLink href="#" [isActive]="p === page()" (click)="go(p, $event)">{{ p }}</a>
              </li>
            }
            <li ivPaginationItem><a ivPaginationNext href="#" text="" (click)="go(page() + 1, $event)"></a></li>
          </ul>
        </nav>
      </iv-card-footer>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Choose a plan</iv-card-title>
        <iv-card-description>Change it any time.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-radio-group value="pro" aria-label="Plan" class="flex flex-col gap-2">
          @for (p of plans; track p.value) {
            <label class="has-[[data-state=checked]]:border-primary flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border p-3 text-sm">
              <iv-radio-group-item [value]="p.value" />
              <span class="flex flex-1 flex-col">
                <span class="font-medium">{{ p.label }}</span>
                <span class="text-muted-foreground text-xs">{{ p.hint }}</span>
              </span>
              <span class="font-medium tabular-nums">{{ p.price }}</span>
            </label>
          }
        </iv-radio-group>
      </iv-card-content>
      <iv-card-footer>
        <button ivButton class="w-full">Continue</button>
      </iv-card-footer>
    </iv-card>

    <!-- Checkout -->
    <iv-card>
      <iv-card-header>
        <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().shoppingBag" class="text-muted-foreground size-4"></svg>Order summary</iv-card-title>
        <iv-card-description>Ships in 2 to 4 days.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-3 text-sm">
        @for (item of items; track item.name) {
          <div class="flex justify-between gap-4">
            <span>{{ item.name }} <span class="text-muted-foreground">× {{ item.qty }}</span></span>
            <span class="tabular-nums">\${{ item.price * item.qty }}</span>
          </div>
        }
        <iv-radio-group [value]="delivery()" (valueChange)="delivery.set($event ?? 'standard')" aria-label="Delivery" class="grid grid-cols-2 gap-2">
          @for (d of deliveries; track d.value) {
            <label class="has-[[data-state=checked]]:border-primary flex cursor-pointer items-start gap-2 rounded-[var(--radius)] border p-2.5">
              <iv-radio-group-item [value]="d.value" class="mt-0.5" />
              <span class="flex flex-col">
                <span class="font-medium">{{ d.label }}</span>
                <span class="text-muted-foreground text-xs">{{ d.price ? '$' + d.price : 'Free' }}</span>
              </span>
            </label>
          }
        </iv-radio-group>
        <iv-separator />
        <div class="flex justify-between font-medium"><span>Total</span><span class="tabular-nums">\${{ total() }}</span></div>
      </iv-card-content>
      <iv-card-footer>
        <button ivButton class="w-full" [ivAlertDialogTrigger]="pay"><svg [ivIcon]="icons().lock"></svg>Pay \${{ total() }}</button>
      </iv-card-footer>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Invite your team</iv-card-title>
        <iv-card-description>They get access to this project only.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        @for (m of team; track m.name) {
          <div class="flex items-center gap-3">
            <iv-avatar size="sm" class="shrink-0"><iv-avatar-fallback>{{ m.initials }}</iv-avatar-fallback></iv-avatar>
            <span class="min-w-0 flex-1 truncate text-sm">{{ m.name }}</span>
            <iv-select [value]="m.role">
              <iv-select-trigger size="sm" class="w-24" [aria-label]="'Role of ' + m.name" />
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
        <input ivInput type="email" placeholder="grace@example.com" aria-label="Email to invite" class="min-w-0 flex-1" />
        <button ivButton variant="secondary"><svg [ivIcon]="icons().send"></svg>Invite</button>
      </iv-card-footer>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Verify it's you</iv-card-title>
        <iv-card-description>Enter the 6-digit code we sent to your phone.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex justify-center">
        <iv-input-otp maxLength="6" aria-label="One-time code">
          <iv-input-otp-group>
            <iv-input-otp-slot index="0" />
            <iv-input-otp-slot index="1" />
            <iv-input-otp-slot index="2" />
          </iv-input-otp-group>
          <iv-input-otp-separator />
          <iv-input-otp-group>
            <iv-input-otp-slot index="3" />
            <iv-input-otp-slot index="4" />
            <iv-input-otp-slot index="5" />
          </iv-input-otp-group>
        </iv-input-otp>
      </iv-card-content>
      <iv-card-footer class="justify-between">
        <button ivButton variant="link" size="sm" class="px-0">Send again</button>
        <button ivButton size="sm">Verify</button>
      </iv-card-footer>
    </iv-card>

    <!-- Settings -->
    <iv-card>
      <iv-card-header>
        <iv-card-title>Profile</iv-card-title>
        <iv-card-description>Shown to your team.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-field-group>
          <iv-field>
            <label ivLabel [for]="prefix() + '-name'">Name</label>
            <input ivInput [id]="prefix() + '-name'" value="Ada Lovelace" />
          </iv-field>
          <iv-field>
            <label ivLabel [for]="prefix() + '-lang'">Language</label>
            <iv-native-select>
              <select ivNativeSelect [id]="prefix() + '-lang'">
                <option ivNativeSelectOption value="en">English</option>
                <option ivNativeSelectOption value="de">Deutsch</option>
                <option ivNativeSelectOption value="fr">Français</option>
              </select>
            </iv-native-select>
          </iv-field>
          <iv-field>
            <label ivLabel [for]="prefix() + '-bio'">Bio</label>
            <textarea ivTextarea [id]="prefix() + '-bio'" rows="2">Wrote the first program. Likes engines.</textarea>
          </iv-field>
        </iv-field-group>
      </iv-card-content>
      <iv-card-footer class="justify-end gap-2">
        <button ivButton variant="ghost">Cancel</button>
        <button ivButton><svg [ivIcon]="icons().save"></svg>Save</button>
      </iv-card-footer>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().clock" class="text-muted-foreground size-4"></svg>Maintenance window</iv-card-title>
        <iv-card-description>Pick a day. We notify the team.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex justify-center">
        <iv-calendar [(selected)]="date" class="rounded-[var(--radius)] border" />
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().bell" class="text-muted-foreground size-4"></svg>Notifications</iv-card-title>
        <iv-card-description>What we email you about.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
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
          <span class="text-sm font-medium" [id]="prefix() + '-when'">Email me</span>
          <iv-radio-group value="daily" [attr.aria-labelledby]="prefix() + '-when'" class="flex flex-col gap-2">
            @for (f of frequency; track f.value) {
              <label class="flex items-center gap-2 text-sm"><iv-radio-group-item [value]="f.value" /> {{ f.label }}</label>
            }
          </iv-radio-group>
        </div>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().database" class="text-muted-foreground size-4"></svg>Storage</iv-card-title>
        <iv-card-description>68 GB of 100 GB used.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <iv-progress [value]="68" aria-label="Storage used" />
        <div class="flex flex-wrap gap-2">
          <button ivButton variant="outline" size="sm" [ivSheetTrigger]="filters"><svg [ivIcon]="icons().settings"></svg>Filters</button>
          <iv-popover>
            <button ivButton ivPopoverTrigger variant="outline" size="sm"><svg [ivIcon]="icons().share"></svg>Share</button>
            <iv-popover-content class="w-64">
              <iv-popover-header>
                <iv-popover-title>Share link</iv-popover-title>
                <iv-popover-description>Anyone with the link can view.</iv-popover-description>
              </iv-popover-header>
              <input ivInput aria-label="Share link" value="acme.dev/s/9f2k" readonly />
            </iv-popover-content>
          </iv-popover>
          <button ivButton variant="destructive" size="sm" [ivAlertDialogTrigger]="remove"><svg [ivIcon]="icons().trash"></svg>Delete</button>
        </div>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title>Spending limit</iv-card-title>
        <iv-card-description>We pause builds when you reach it.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-3">
        <div class="flex items-baseline justify-between text-sm">
          <span [id]="prefix() + '-limit'" class="text-muted-foreground">Monthly limit</span>
          <span class="text-lg font-semibold tabular-nums">\${{ limit() }}</span>
        </div>
        <iv-slider [aria-labelledby]="prefix() + '-limit'" [value]="[limit()]" (valueChange)="limit.set($event[0])" [min]="0" [max]="500" [step]="10" />
      </iv-card-content>
    </iv-card>

    <!-- Real charts: they take the accent's chart colors. -->
    @if (charts()) {
      @defer (on viewport) {
        <iv-card>
          <iv-card-header>
            <iv-card-title>Visitors</iv-card-title>
            <iv-card-description>Desktop and mobile, last 6 months.</iv-card-description>
          </iv-card-header>
          <iv-card-content>
            <iv-chart [config]="visitorsConfig" class="aspect-auto h-44 w-full">
              <svg ivAreaChart [data]="visitors" [margin]="{ left: 12, right: 12 }" aria-label="Visitors per month, desktop and mobile">
                <g ivCartesianGrid [vertical]="false" />
                <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="8" />
                <defs>
                  <linearGradient [attr.id]="prefix() + '-fill-desktop'" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="var(--color-desktop)" stop-opacity="0.8" />
                    <stop offset="95%" stop-color="var(--color-desktop)" stop-opacity="0.1" />
                  </linearGradient>
                  <linearGradient [attr.id]="prefix() + '-fill-mobile'" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="var(--color-mobile)" stop-opacity="0.8" />
                    <stop offset="95%" stop-color="var(--color-mobile)" stop-opacity="0.1" />
                  </linearGradient>
                </defs>
                <g ivArea dataKey="mobile" curve="natural" [fillOpacity]="0.4" [fill]="'url(#' + prefix() + '-fill-mobile)'" stackId="a" />
                <g ivArea dataKey="desktop" curve="natural" [fillOpacity]="0.4" [fill]="'url(#' + prefix() + '-fill-desktop)'" stackId="a" />
              </svg>
              <iv-chart-tooltip [cursor]="false" />
            </iv-chart>
          </iv-card-content>
          <iv-card-footer class="text-muted-foreground gap-2 text-sm">
            <svg [ivIcon]="icons().trendingUp" class="size-4"></svg>Up 5.2% this month
          </iv-card-footer>
        </iv-card>
      } @placeholder {
        <div class="bg-card h-80 rounded-xl border" aria-hidden="true"></div>
      }
    }

    @if (charts()) {
      @defer (on viewport) {
        <iv-card>
          <iv-card-header class="items-center text-center">
            <iv-card-title>Browsers</iv-card-title>
            <iv-card-description>Visitors this month.</iv-card-description>
          </iv-card-header>
          <iv-card-content>
            <iv-chart [config]="browsersConfig" class="mx-auto aspect-square max-h-52">
              <svg ivPieChart aria-label="Visitors by browser">
                <g ivPie [data]="browsers" dataKey="visitors" nameKey="browser" [innerRadius]="56" [strokeWidth]="5">
                  <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                    <svg:text [attr.x]="cx" [attr.y]="cy" text-anchor="middle" dominant-baseline="middle">
                      <svg:tspan [attr.x]="cx" [attr.y]="cy" class="fill-foreground text-2xl font-bold">{{ browserTotal.toLocaleString('en-US') }}</svg:tspan>
                      <svg:tspan [attr.x]="cx" [attr.y]="cy + 22" class="fill-muted-foreground text-xs">Visitors</svg:tspan>
                    </svg:text>
                  </ng-template>
                </g>
              </svg>
              <iv-chart-tooltip [cursor]="false" hideLabel />
            </iv-chart>
          </iv-card-content>
        </iv-card>
      } @placeholder {
        <div class="bg-card h-80 rounded-xl border" aria-hidden="true"></div>
      }
    }

    <!-- An alert with an action. -->
    <iv-alert>
      <svg [ivIcon]="icons().bell"></svg>
      <iv-alert-title>Your trial ends in 3 days</iv-alert-title>
      <iv-alert-description>
        Add a card to keep your projects running.
        <button ivButton size="sm" variant="outline" class="mt-2">Add a card</button>
      </iv-alert-description>
    </iv-alert>

    @if (charts()) {
      @defer (on viewport) {
        <iv-card>
          <iv-card-header class="items-center text-center">
            <iv-card-title>Uptime</iv-card-title>
            <iv-card-description>Last 30 days.</iv-card-description>
          </iv-card-header>
          <iv-card-content>
            <iv-chart [config]="uptimeConfig" class="mx-auto aspect-square max-h-48">
              <svg ivRadialChart [data]="uptime" [startAngle]="90" [endAngle]="-266" [outerRadius]="80" [innerRadius]="68" aria-label="Uptime 99.2 percent">
                <g ivPolarGrid gridType="circle" [radialLines]="false" stroke="none" class="first:fill-muted last:fill-card" [polarRadius]="[80, 68]" />
                <g ivRadialBar dataKey="uptime" background [cornerRadius]="10" />
                <g ivPolarRadiusAxis>
                  <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                    <svg:text [attr.x]="cx" [attr.y]="cy" text-anchor="middle" dominant-baseline="middle">
                      <svg:tspan [attr.x]="cx" [attr.y]="cy" class="fill-foreground text-3xl font-bold">99.2%</svg:tspan>
                      <svg:tspan [attr.x]="cx" [attr.y]="cy + 22" class="fill-muted-foreground text-xs">Up</svg:tspan>
                    </svg:text>
                  </ng-template>
                </g>
              </svg>
            </iv-chart>
          </iv-card-content>
          <iv-card-footer class="text-muted-foreground justify-center text-sm">Last incident 12 days ago.</iv-card-footer>
        </iv-card>
      } @placeholder {
        <div class="bg-card h-80 rounded-xl border" aria-hidden="true"></div>
      }
    }

    @if (charts()) {
      @defer (on viewport) {
        <iv-card>
          <iv-card-header>
            <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().chartLine" class="text-muted-foreground size-4"></svg>Response time</iv-card-title>
            <iv-card-description>Median and slowest 5%, in ms.</iv-card-description>
          </iv-card-header>
          <iv-card-content>
            <iv-chart [config]="latencyConfig" class="aspect-auto h-40 w-full">
              <svg ivLineChart [data]="latency" [margin]="{ left: 12, right: 12 }" aria-label="Response time per day, median and 95th percentile">
                <g ivCartesianGrid [vertical]="false" />
                <g ivXAxis dataKey="day" [tickLine]="false" [axisLine]="false" [tickMargin]="8" />
                <g ivLine dataKey="p95" curve="monotone" [strokeWidth]="2" [dot]="false" />
                <g ivLine dataKey="p50" curve="monotone" [strokeWidth]="2" [dot]="false" />
              </svg>
              <iv-chart-tooltip [cursor]="false" />
              <iv-chart-legend />
            </iv-chart>
          </iv-card-content>
        </iv-card>
      } @placeholder {
        <div class="bg-card h-72 rounded-xl border" aria-hidden="true"></div>
      }
    }

    <!-- Nothing here yet: an empty state that says what to do. -->
    <iv-empty class="bg-card rounded-xl border border-dashed">
      <iv-empty-header>
        <iv-empty-media variant="icon"><svg [ivIcon]="icons().share"></svg></iv-empty-media>
        <iv-empty-title>No webhooks yet</iv-empty-title>
        <iv-empty-description>Send events to your own server when a deploy finishes.</iv-empty-description>
      </iv-empty-header>
      <iv-empty-content>
        <button ivButton size="sm"><svg [ivIcon]="icons().plus"></svg>Add a webhook</button>
      </iv-empty-content>
    </iv-empty>

    <!-- Questions: one open at a time. -->
    <iv-card>
      <iv-card-header>
        <iv-card-title>Questions</iv-card-title>
      </iv-card-header>
      <iv-card-content>
        <iv-accordion type="single" value="zone">
          @for (q of faq; track q.value) {
            <iv-accordion-item [value]="q.value">
              <iv-accordion-trigger>{{ q.question }}</iv-accordion-trigger>
              <iv-accordion-content class="text-muted-foreground">{{ q.answer }}</iv-accordion-content>
            </iv-accordion-item>
          }
        </iv-accordion>
      </iv-card-content>
    </iv-card>

    <iv-card>
      <iv-card-header>
        <iv-card-title class="flex items-center gap-2"><svg [ivIcon]="icons().gitBranch" class="text-muted-foreground size-4"></svg>Recent deploys</iv-card-title>
        <iv-card-description>The last changes to production.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <iv-table>
          <thead ivTableHeader>
            <tr ivTableRow>
              <th ivTableHead class="pl-0">Change</th>
              <th ivTableHead class="pr-0 text-right">Status</th>
            </tr>
          </thead>
          <tbody ivTableBody>
            @for (row of deploys; track row.sha) {
              <tr ivTableRow>
                <td ivTableCell class="pl-0">
                  <span class="flex flex-col">
                    <span class="font-medium">{{ row.title }}</span>
                    <span class="text-muted-foreground font-mono text-xs">{{ row.sha }}</span>
                  </span>
                </td>
                <td ivTableCell class="pr-0 text-right">
                  <iv-badge [variant]="row.status === 'Failed' ? 'destructive' : row.status === 'Building' ? 'outline' : 'secondary'">{{ row.status }}</iv-badge>
                </td>
              </tr>
            }
          </tbody>
        </iv-table>
      </iv-card-content>
    </iv-card>

    <ng-template #deploy>
      <iv-dialog-header>
        <iv-dialog-title>Deploy to production</iv-dialog-title>
        <iv-dialog-description>main at 4f2a91c. About 2 minutes.</iv-dialog-description>
      </iv-dialog-header>
      <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Run the smoke tests first</label>
      <iv-dialog-footer>
        <button ivButton variant="outline" ivDialogClose>Cancel</button>
        <button ivButton ivDialogClose><svg [ivIcon]="icons().cloudUpload"></svg>Deploy</button>
      </iv-dialog-footer>
    </ng-template>
    <ng-template #filters>
      <iv-sheet-header>
        <iv-sheet-title>Filters</iv-sheet-title>
        <iv-sheet-description>Show only what you need.</iv-sheet-description>
      </iv-sheet-header>
      <div class="flex flex-col gap-4 px-4">
        <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Images</label>
        <label class="flex items-center gap-2 text-sm"><iv-checkbox /> Logs</label>
      </div>
    </ng-template>
    <ng-template #remove>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Delete old builds?</iv-alert-dialog-title>
        <iv-alert-dialog-description>Builds older than 30 days are removed. This cannot be undone.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Cancel</button>
        <button ivAlertDialogAction variant="destructive">Delete</button>
      </iv-alert-dialog-footer>
    </ng-template>
    <ng-template #pay>
      <iv-alert-dialog-header>
        <iv-alert-dialog-title>Place this order?</iv-alert-dialog-title>
        <iv-alert-dialog-description>We charge \${{ total() }} to the card ending in 4242 and email a receipt.</iv-alert-dialog-description>
      </iv-alert-dialog-header>
      <iv-alert-dialog-footer>
        <button ivAlertDialogCancel>Go back</button>
        <button ivAlertDialogAction>Place order</button>
      </iv-alert-dialog-footer>
    </ng-template>
  `,
})
export class SceneWall {
  readonly prefix = input('wall');
  /** Chart cards, loaded when they scroll into view. Off on the home page: its first load stays light. */
  readonly charts = input(true);
  /** Card icons in the picked icon library. */
  protected readonly icons = inject(PlaygroundLook).icons;
  private readonly preset = inject(PlaygroundLook).preset;

  /** Theme variables shown as swatches, in theme.css order. */
  protected readonly tokens = [
    '--background', '--foreground', '--primary', '--secondary', '--muted', '--accent',
    '--border', '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
  ];
  protected readonly styleTitle = computed(() => STYLES.find((s) => s.name === this.preset().style)?.label ?? this.preset().style);
  protected readonly fontTitle = computed(() => fontTitle(this.preset().font));
  protected readonly headingTitle = computed(() =>
    this.preset().fontHeading === 'inherit' ? this.fontTitle() : fontTitle(this.preset().fontHeading),
  );

  protected readonly stats = [
    { label: 'Deploys today', value: '128', delta: '+12%', good: true, up: true },
    { label: 'Open incidents', value: '2', delta: '1 urgent', good: false, up: true },
  ];
  protected readonly builds = [
    {
      value: 'running',
      items: [
        { title: 'Faster image resize', detail: 'main, started 1 minute ago' },
        { title: 'Dark mode for settings', detail: 'preview, started 3 minutes ago' },
      ],
    },
    {
      value: 'finished',
      items: [
        { title: 'Fix login redirect', detail: 'main, 2 minutes 14 seconds' },
        { title: 'Bump Angular to 22.1', detail: 'main, 3 minutes 2 seconds' },
      ],
    },
  ];
  protected readonly uptime = [{ name: 'web', uptime: 99.2, fill: 'var(--color-uptime)' }];
  protected readonly uptimeConfig: IvChartConfig = { uptime: { label: 'Uptime', color: 'var(--chart-1)' } };
  protected readonly latency = [
    { day: 'Mon', p50: 82, p95: 210 },
    { day: 'Tue', p50: 78, p95: 190 },
    { day: 'Wed', p50: 91, p95: 260 },
    { day: 'Thu', p50: 74, p95: 175 },
    { day: 'Fri', p50: 70, p95: 168 },
    { day: 'Sat', p50: 66, p95: 150 },
    { day: 'Sun', p50: 68, p95: 155 },
  ];
  protected readonly latencyConfig: IvChartConfig = {
    p50: { label: 'Median', color: 'var(--chart-1)' },
    p95: { label: 'Slowest 5%', color: 'var(--chart-3)' },
  };
  protected readonly visitors = [
    { month: 'Jun', desktop: 186, mobile: 80 },
    { month: 'Jul', desktop: 305, mobile: 200 },
    { month: 'Aug', desktop: 237, mobile: 120 },
    { month: 'Sep', desktop: 73, mobile: 190 },
    { month: 'Oct', desktop: 209, mobile: 130 },
    { month: 'Nov', desktop: 214, mobile: 140 },
  ];
  protected readonly visitorsConfig: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  };
  protected readonly browsers = [
    { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
    { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
    { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
    { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
    { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
  ];
  protected readonly browserTotal = this.browsers.reduce((sum, b) => sum + b.visitors, 0);
  protected readonly browsersConfig: IvChartConfig = {
    visitors: { label: 'Visitors' },
    chrome: { label: 'Chrome', color: 'var(--chart-1)' },
    safari: { label: 'Safari', color: 'var(--chart-2)' },
    firefox: { label: 'Firefox', color: 'var(--chart-3)' },
    edge: { label: 'Edge', color: 'var(--chart-4)' },
    other: { label: 'Other', color: 'var(--chart-5)' },
  };

  protected readonly done = signal(2);
  protected readonly gates = [
    { label: 'Unit tests', new: false },
    { label: 'SSR smoke', new: true },
    { label: 'Package smoke', new: true },
    { label: 'CI', new: false },
  ];

  protected readonly members = MEMBERS;
  protected readonly query = signal('');
  protected readonly page = signal(1);
  private readonly matches = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? MEMBERS.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(q)) : MEMBERS;
  });
  protected readonly pages = computed(() =>
    Array.from({ length: Math.max(1, Math.ceil(this.matches().length / PAGE_SIZE)) }, (_, i) => i + 1),
  );
  protected readonly rows = computed(() => this.matches().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE));

  protected readonly plans = [
    { value: 'hobby', label: 'Hobby', hint: 'One project', price: '$0' },
    { value: 'pro', label: 'Pro', hint: 'Unlimited projects', price: '$12' },
    { value: 'team', label: 'Team', hint: 'Shared billing and roles', price: '$40' },
  ];

  protected readonly items = [
    { name: 'Desk lamp', qty: 1, price: 64 },
    { name: 'Linen notebook', qty: 2, price: 18 },
  ];
  protected readonly deliveries = [
    { value: 'standard', label: 'Standard', price: 0 },
    { value: 'express', label: 'Express', price: 12 },
  ];
  protected readonly delivery = signal('standard');
  protected readonly total = computed(
    () => this.items.reduce((s, i) => s + i.price * i.qty, 0) + this.deliveries.find((d) => d.value === this.delivery())!.price,
  );

  protected readonly team = [
    { name: 'Ada Lovelace', initials: 'AL', role: 'owner' },
    { name: 'Grace Hopper', initials: 'GH', role: 'editor' },
  ];
  protected readonly date = signal<Date | null>(new Date(2026, 10, 14));
  protected readonly notifications = [
    { label: 'Mentions', hint: 'When someone tags you.', on: true },
    { label: 'Security alerts', hint: 'New sign-ins.', on: true },
    { label: 'Product news', hint: 'A few times a year.', on: false },
  ];
  protected readonly frequency = [
    { value: 'now', label: 'Right away' },
    { value: 'daily', label: 'Once a day' },
    { value: 'weekly', label: 'Once a week' },
  ];
  protected readonly limit = signal(120);
  protected readonly faq = [
    { value: 'zone', question: 'Do I need zone.js?', answer: 'No. Every component runs zoneless, on signals.' },
    { value: 'own', question: 'Can I change the source?', answer: 'Yes. npx ivorie add copies the files into your app.' },
    { value: 'ssr', question: 'Does it render on the server?', answer: 'Yes, and it hydrates without warnings.' },
  ];
  protected readonly deploys = [
    { title: 'Faster image resize', sha: '4f2a91c', status: 'Building' },
    { title: 'Fix login redirect', sha: '9b7e0d2', status: 'Ready' },
    { title: 'Bump Angular to 22.1', sha: '07d5e44', status: 'Failed' },
  ];

  protected toggle(i: number, on: boolean): void {
    this.done.set(on ? i + 1 : i);
  }

  protected search(q: string): void {
    this.query.set(q);
    this.page.set(1);
  }

  protected go(next: number, event: Event): void {
    event.preventDefault();
    this.page.set(Math.min(Math.max(next, 1), this.pages().length));
  }
}
