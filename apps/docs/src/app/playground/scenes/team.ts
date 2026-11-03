import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';
import { IvIcon } from '@inlaylab/ivorie/icon';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_PAGINATION_IMPORTS } from '@inlaylab/ivorie/pagination';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';

const MEMBERS = [
  { name: 'Ada Lovelace', email: 'ada@acme.dev', role: 'Owner', status: 'Active' },
  { name: 'Grace Hopper', email: 'grace@acme.dev', role: 'Admin', status: 'Active' },
  { name: 'Alan Turing', email: 'alan@acme.dev', role: 'Member', status: 'Invited' },
  { name: 'Katherine Johnson', email: 'katherine@acme.dev', role: 'Member', status: 'Active' },
  { name: 'Edsger Dijkstra', email: 'edsger@acme.dev', role: 'Member', status: 'Suspended' },
  { name: 'Barbara Liskov', email: 'barbara@acme.dev', role: 'Admin', status: 'Active' },
  { name: 'Donald Knuth', email: 'donald@acme.dev', role: 'Member', status: 'Active' },
  { name: 'Margaret Hamilton', email: 'margaret@acme.dev', role: 'Member', status: 'Invited' },
].map((m) => ({ ...m, initials: m.name.split(' ').map((w) => w[0]).join('') }));
const PAGE_SIZE = 4;

/** Playground scene: a member list with search, row menus and pages. */
@Component({
  selector: 'docs-scene-team',
  imports: [
    IV_AVATAR_IMPORTS,
    IvBadge,
    IvButton,
    IV_CARD_IMPORTS,
    IV_DROPDOWN_MENU_IMPORTS,
    IvIcon,
    IV_INPUT_IMPORTS,
    IV_PAGINATION_IMPORTS,
    IV_TABLE_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="mx-auto max-w-4xl">
      <iv-card-header>
        <iv-card-title class="cn-font-heading text-xl">Team</iv-card-title>
        <iv-card-description>{{ members.length }} people in Acme. Admins can invite and remove members.</iv-card-description>
        <iv-card-action>
          <button ivButton size="sm">Invite</button>
        </iv-card-action>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <input ivInput type="search" aria-label="Search members" placeholder="Search by name or email" class="max-w-xs" [value]="query()" (input)="search($any($event.target).value)" />
        <iv-table>
          <thead ivTableHeader>
            <tr ivTableRow>
              <th ivTableHead>Member</th>
              <th ivTableHead>Role</th>
              <th ivTableHead>Status</th>
              <th ivTableHead><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody ivTableBody>
            @for (m of rows(); track m.email) {
              <tr ivTableRow>
                <td ivTableCell>
                  <span class="flex items-center gap-3">
                    <iv-avatar size="sm"><iv-avatar-fallback>{{ m.initials }}</iv-avatar-fallback></iv-avatar>
                    <span class="flex min-w-0 flex-col">
                      <span class="font-medium">{{ m.name }}</span>
                      <span class="text-muted-foreground text-xs">{{ m.email }}</span>
                    </span>
                  </span>
                </td>
                <td ivTableCell>{{ m.role }}</td>
                <td ivTableCell>
                  <iv-badge [variant]="m.status === 'Suspended' ? 'destructive' : m.status === 'Invited' ? 'outline' : 'secondary'">{{ m.status }}</iv-badge>
                </td>
                <td ivTableCell class="text-right">
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
                <td ivTableCell colspan="4" class="text-muted-foreground py-8 text-center">No member matches "{{ query() }}".</td>
              </tr>
            }
          </tbody>
        </iv-table>
      </iv-card-content>
      <iv-card-footer class="flex-wrap justify-between gap-2">
        <span class="text-muted-foreground text-sm">Page {{ page() }} of {{ pages().length }}</span>
        <nav ivPagination class="mx-0 w-auto">
          <ul ivPaginationContent>
            <li ivPaginationItem><a ivPaginationPrevious href="#" (click)="go(page() - 1, $event)"></a></li>
            @for (p of pages(); track p) {
              <li ivPaginationItem>
                <a ivPaginationLink href="#" [isActive]="p === page()" (click)="go(p, $event)">{{ p }}</a>
              </li>
            }
            <li ivPaginationItem><a ivPaginationNext href="#" (click)="go(page() + 1, $event)"></a></li>
          </ul>
        </nav>
      </iv-card-footer>
    </iv-card>
  `,
})
export class SceneTeam {
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

  protected search(q: string): void {
    this.query.set(q);
    this.page.set(1);
  }

  protected go(next: number, event: Event): void {
    event.preventDefault();
    this.page.set(Math.min(Math.max(next, 1), this.pages().length));
  }
}
