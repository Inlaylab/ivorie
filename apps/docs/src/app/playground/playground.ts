import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  TemplateRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DIALOG_IMPORTS, IvDialog } from '@inlaylab/ivorie/dialog';
import { IvKbd } from '@inlaylab/ivorie/kbd';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { PREVIEW_WIDTHS, PreviewFrame, type PreviewWidth } from '../preview/preview-frame';
import { CopyButton } from '../ui/copy-button';
import { ThemeControls } from './theme-controls';
import { ThemePicker } from './theme-picker';
import { Appearance } from '../shell/appearance';
import { DOCS_PRESET, PREVIEW_ICONS, PlaygroundLook } from './playground-look';
import { encodePreset, type Preset } from './preset-code';
import { ACCENTS, BASE_COLORS, FONTS, RADII, THEMES, THEME_INFO, THEME_ORDER, type ThemeName } from '../../generated/looks';
import { THEME_LIST } from '../shell/appearance-options';
import { IVORIE } from '../../generated/cli';

// Where the playground starts: the glass theme, also what `ivorie init` does on its own. No ?preset=, no --theme.
const START_CODE = encodePreset(DOCS_PRESET);
// Shuffle never lands on a legacy style.
const PICKABLE_THEMES = THEME_LIST.filter((t) => t.group !== 'legacy');
type Target = 'new' | 'existing';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
/** The fields the rail lists when they differ from the theme, in rail order, with their names. */
const CHANGE_FIELDS: [keyof Preset, string][] = [
  ['baseColor', 'Base'],
  ['accent', 'Accent'],
  ['chartColor', 'Charts'],
  ['menuAccent', 'Menu highlight'],
  ['font', 'Font'],
  ['fontHeading', 'Heading font'],
  ['radius', 'Radius'],
  ['iconLibrary', 'Icons'],
  ['density', 'Density'],
  ['contrast', 'Contrast'],
  ['motion', 'Motion'],
  ['panels', 'Panels'],
  ['rim', 'Rim'],
  ['shadow', 'Shadow'],
  ['blur', 'Blur'],
  ['ambient', 'Ambient'],
];

@Component({
  selector: 'docs-playground',
  imports: [
    NgTemplateOutlet,
    IvButton,
    IV_DIALOG_IMPORTS,
    IV_SHEET_IMPORTS,
    CopyButton,
    ThemeControls,
    ThemePicker,
    PreviewFrame,
    IvKbd,
    IV_SELECT_IMPORTS,
  ],
  providers: [PlaygroundLook, PREVIEW_ICONS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block gap-4 p-3 pb-20 sm:p-4 sm:pb-20 lg:grid lg:pb-4 lg:h-[calc(100svh-var(--header-height))] lg:grid-cols-[19.5rem_minmax(0,1fr)]' },
  template: `
    <!-- The panel: one row per axis, label over value, a picture on the right. Actions at the bottom. -->
    <aside aria-labelledby="pg-title" class="docs-pane hidden min-h-0 flex-col overflow-hidden lg:flex">
      <div class="flex items-center justify-between border-b py-2 pr-2 pl-4">
        <h1 id="pg-title" class="text-foreground text-sm font-semibold">Customize</h1>
        <button ivButton variant="ghost" size="icon-sm" aria-label="Reset to default" [disabled]="isDefault()" (click)="reset()" data-testid="reset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
      <!-- What you changed from the theme, one chip each: the quickest way back from ten clicks. -->
      @if (changes().length) {
        <div data-testid="changed" class="flex flex-col gap-2 border-b px-4 py-3">
          <span class="text-muted-foreground text-xs font-medium">Changed from {{ themeLabel() }}</span>
          <ul class="flex flex-wrap gap-1.5">
            @for (c of changes(); track c.key) {
              <li [attr.data-field]="c.key" class="bg-foreground/[0.04] inline-flex items-center gap-1 rounded-full border py-0.5 pr-0.5 pl-2.5 text-xs">
                <span class="text-muted-foreground">{{ c.label }}</span>
                <span class="text-foreground font-medium">{{ c.value }}</span>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] focus-visible:outline-ring grid size-6 place-items-center rounded-full focus-visible:outline-2"
                  [attr.aria-label]="'Reset ' + c.label.toLowerCase()"
                  (click)="undo(c.key)"
                >
                  <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </li>
            }
          </ul>
        </div>
      }
      <!-- relative: the controls' sr-only inputs are absolute; positioned here, they stay inside this scroll clip. -->
      <div data-testid="controls-scroll" class="no-scrollbar relative min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <docs-theme-controls [look]="look" name="rail" [withTheme]="false" />
      </div>

      <div class="flex flex-col gap-2 border-t p-3">
        <div class="bg-foreground/[0.04] flex items-center gap-1 rounded-lg border py-0.5 pr-0.5 pl-2.5 font-mono text-xs">
          <span class="min-w-0 flex-1 truncate" data-testid="panel-command" [title]="command()">{{ command() }}</span>
          <docs-copy-button [text]="command()" label="Copy command" />
        </div>
        <button ivButton class="w-full" (click)="copyCommand()" data-testid="copy-init">{{ commandCopied() ? 'Copied' : 'Copy init command' }}</button>
        <div class="grid grid-cols-2 gap-2">
          <button ivButton variant="outline" [ivDialogTrigger]="codeDialog">Get code</button>
          <button ivButton variant="outline" (click)="shuffle()" data-testid="shuffle">
            <ng-container [ngTemplateOutlet]="shuffleIcon" />
            Shuffle
          </button>
        </div>
      </div>
    </aside>

    <!-- The stage: the theme tiles, the tools, then the frame in the picked look. Nothing of the site leaks in. -->
    <section aria-label="Preview" class="flex h-[calc(100svh-var(--header-height)-5.5rem)] min-w-0 flex-col gap-3 lg:h-auto lg:min-h-0">
      <!-- The biggest choice gets one click: every theme as a live tile. -->
      <div class="flex min-w-0 flex-col gap-1.5">
        <docs-theme-picker [look]="look" name="pg" />
        <p class="text-muted-foreground truncate text-xs" data-testid="theme-note">{{ themeNote() }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <!-- The screen to judge the look on: the component wall or a whole page. -->
        <div role="radiogroup" aria-label="Screen" class="docs-pane no-scrollbar flex max-w-full gap-0.5 overflow-x-auto rounded-full p-1">
          @for (v of screens; track v.value) {
            <label [class]="pill + ' relative shrink-0 px-3 py-1 text-sm'">
              <input type="radio" class="sr-only" name="pg-screen" [value]="v.value" [checked]="screen() === v.value" (change)="screen.set(v.value)" />
              {{ v.label }}
            </label>
          }
        </div>
        <div role="radiogroup" aria-label="Preview width" class="docs-pane hidden gap-0.5 rounded-full p-1 md:flex">
          @for (w of widths; track w.value) {
            <label [class]="pill + ' relative px-3 py-1 text-sm'">
              <input type="radio" class="sr-only" name="pg-width" [value]="w.value" [checked]="width() === w.value" (change)="width.set(w.value)" />
              {{ w.label }}
            </label>
          }
        </div>
        <div role="radiogroup" aria-label="Mode" class="docs-pane flex gap-0.5 rounded-full p-1">
          @for (m of modes; track m.value) {
            <label [class]="pill + ' relative px-3 py-1 text-sm'">
              <input type="radio" class="sr-only" name="pg-mode" [value]="m.value" [checked]="(appearance.dark() ? 'dark' : 'light') === m.value" (change)="appearance.setMode(m.value)" />
              {{ m.label }}
            </label>
          }
        </div>
        <span class="flex-1"></span>
        <div class="flex items-center gap-1">
          @if (compare()) {
            <iv-select [value]="other()" (valueChange)="setOther($any($event))">
              <iv-select-trigger class="h-9 w-32 rounded-full" aria-label="Compare with" />
              <iv-select-content>
                @for (t of otherThemes(); track t.name) {
                  <iv-select-item [value]="t.name">{{ t.label }}</iv-select-item>
                }
              </iv-select-content>
            </iv-select>
          }
          <button
            ivButton
            type="button"
            variant="ghost"
            class="aria-pressed:bg-foreground/[0.08] rounded-full"
            data-testid="compare"
            [attr.aria-pressed]="compare()"
            (click)="compare.set(!compare())"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16" />
            </svg>
            Compare
          </button>
          <button ivButton variant="ghost" class="hidden rounded-full lg:inline-flex" (click)="copyLink()" data-testid="copy-link">
            <ng-container [ngTemplateOutlet]="linkIcon" />
            {{ linkCopied() ? 'Copied' : 'Copy link' }}
          </button>
          <button ivButton type="button" variant="ghost" size="icon" class="hidden rounded-full lg:inline-flex" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)" (click)="openKeys()">
            <kbd ivKbd>?</kbd>
          </button>
        </div>
      </div>
      <!-- Compare: a second frame on top, clipped to the right of the divider. Same screen, same width, another theme. -->
      <div #frames class="relative min-h-0 flex-1">
        <docs-preview-frame class="absolute inset-0" [path]="path()" [code]="look.code()" [width]="width()" label="Preview" />
        @if (compare()) {
          <docs-preview-frame
            data-testid="compare-frame"
            class="absolute inset-0"
            [style.clip-path]="'inset(0 0 0 ' + split() + '%)'"
            [path]="path()"
            [code]="otherCode()"
            [width]="width()"
            [label]="'Preview in ' + otherLabel()"
          />
          <span class="bg-foreground/80 text-background pointer-events-none absolute bottom-3 left-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium">Your look</span>
          <span class="bg-foreground/80 text-background pointer-events-none absolute right-3 bottom-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium">{{ otherLabel() }}</span>
          <div
            role="separator"
            tabindex="0"
            aria-orientation="vertical"
            aria-label="Compare divider"
            aria-valuemin="10"
            aria-valuemax="90"
            [attr.aria-valuenow]="split()"
            class="focus-visible:outline-ring absolute inset-y-0 z-20 w-8 -translate-x-1/2 cursor-ew-resize touch-none focus-visible:outline-2"
            [style.left.%]="split()"
            (keydown)="nudge($event)"
            (pointerdown)="drag($event)"
          >
            <span class="bg-foreground absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" aria-hidden="true"></span>
            <span class="bg-foreground text-background absolute top-1/2 left-1/2 grid size-8 -translate-1/2 place-items-center rounded-full ring-4 ring-(--docs-ground)" aria-hidden="true">
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 7-5 5 5 5M15 7l5 5-5 5" /></svg>
            </span>
          </div>
        }
      </div>
    </section>

    <!-- Small screens: the controls open in a sheet; the actions stay in a bar. -->
    <div class="docs-pane fixed inset-x-3 bottom-3 z-20 flex items-center gap-1 rounded-full p-1 lg:hidden">
      <button ivButton variant="ghost" class="rounded-full" [ivSheetTrigger]="sheet" [ivSheetConfig]="{ side: 'bottom' }">Customize</button>
      <span class="flex-1"></span>
      <ng-container [ngTemplateOutlet]="actions" />
    </div>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Customize</iv-sheet-title>
        <iv-sheet-description>The preview changes behind this panel.</iv-sheet-description>
      </iv-sheet-header>
      <div class="relative flex max-h-[60svh] flex-col overflow-y-auto px-2 pb-6">
        <docs-theme-controls [look]="look" name="sheet" [withTheme]="false" />
      </div>
    </ng-template>

    <ng-template #shuffleIcon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.97a4 4 0 0 0 3.3-1.7l5.45-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.97a4 4 0 0 1 3.3 1.7l.4.63" /><path d="M22 18h-6.04a4 4 0 0 1-3.3-1.8l-.36-.45" />
      </svg>
    </ng-template>

    <ng-template #linkIcon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </ng-template>

    <!-- Phones and tablets: the bar under the preview. -->
    <ng-template #actions>
      <button ivButton variant="ghost" class="rounded-full" (click)="copyLink()" aria-label="Copy link" data-testid="copy-link-bar">
        <ng-container [ngTemplateOutlet]="linkIcon" />
      </button>
      <button ivButton variant="ghost" class="rounded-full" (click)="shuffle()" aria-label="Shuffle the look" data-testid="shuffle-bar">
        <ng-container [ngTemplateOutlet]="shuffleIcon" />
      </button>
      <button ivButton class="rounded-full px-5" [ivDialogTrigger]="codeDialog" data-testid="get-code">Get code</button>
    </ng-template>
    <span class="sr-only" aria-live="polite">{{ linkCopied() ? 'Link copied' : '' }}</span>

    <ng-template #codeDialog>
      <iv-dialog-header>
        <iv-dialog-title>Get the code</iv-dialog-title>
        <iv-dialog-description>{{
          target() === 'new'
            ? 'Run it in your Angular app. It sets up Tailwind, the theme and this look.'
            : 'Run it in an app that has Ivorie. It rewrites the theme and the style.'
        }}</iv-dialog-description>
      </iv-dialog-header>
      <div class="flex min-w-0 flex-col gap-4">
        <div role="radiogroup" aria-label="Install into" class="docs-pane flex gap-0.5 self-start rounded-full p-0.5">
          @for (t of targets; track t.value) {
            <label [class]="pillMuted + ' px-3 py-1 text-sm whitespace-nowrap'">
              <input type="radio" class="sr-only" name="code-target" [value]="t.value" [checked]="target() === t.value" (change)="target.set(t.value)" />
              {{ t.label }}
            </label>
          }
        </div>
        <div data-testid="code-box" class="docs-pane flex items-center gap-2 py-0.5 pr-0.5 pl-3 font-mono text-xs">
          <span class="min-w-0 flex-1 truncate" data-testid="command" [title]="command()">{{ command() }}</span>
          <docs-copy-button [text]="command()" label="Copy command" />
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Preset code</span>
          <div data-testid="code-box" class="docs-pane flex items-center gap-2 py-0.5 pr-0.5 pl-3 font-mono text-xs">
            <span class="min-w-0 flex-1 truncate" data-testid="preset-code">{{ look.code() }}</span>
            <docs-copy-button [text]="look.code()" label="Copy preset code" />
          </div>
        </div>
        <div class="flex min-w-0 flex-col gap-1.5">
          <span class="text-sm font-medium">theme.css variables</span>
          <div class="relative min-w-0">
            <pre data-testid="code-box" class="docs-pane max-h-[40svh] overflow-auto p-3 font-mono text-xs leading-relaxed"><code>{{ look.css() }}</code></pre>
            <docs-copy-button class="absolute top-2 right-2" [text]="look.css()" label="Copy CSS" />
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #keysDialog>
      <iv-dialog-header>
        <iv-dialog-title>Keyboard shortcuts</iv-dialog-title>
        <iv-dialog-description>Single keys. They do nothing while a field has focus.</iv-dialog-description>
      </iv-dialog-header>
      <dl data-testid="shortcuts" class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 text-sm">
        @for (k of shortcuts; track k.key) {
          <dt><kbd ivKbd>{{ k.key }}</kbd></dt>
          <dd class="text-foreground">{{ k.label }}</dd>
        }
      </dl>
    </ng-template>
  `,
})
export default class PlaygroundPage {
  protected readonly look = inject(PlaygroundLook);
  protected readonly appearance = inject(Appearance);
  protected readonly modes = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
  ];
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  /** False until the URL preset is read in the browser, so the server markup and the first client render match. */
  private readonly ready = signal(false);

  protected readonly targets: { value: Target; label: string }[] = [
    { value: 'new', label: 'New app' },
    { value: 'existing', label: 'Existing app' },
  ];
  protected readonly target = signal<Target>('new');
  protected readonly widths = PREVIEW_WIDTHS;
  protected readonly width = signal<PreviewWidth>('desktop');
  /** A segment on a pane: the picked one is filled. */
  protected readonly pill =
    'has-checked:bg-primary has-checked:text-primary-foreground text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full font-medium transition-colors duration-(--docs-dur) has-focus-visible:outline-2';
  /** The same inside a dialog, on a muted track. */
  protected readonly pillMuted =
    'has-checked:bg-foreground has-checked:text-background text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full font-medium transition-colors has-focus-visible:outline-2';
  protected readonly linkCopied = signal(false);
  protected readonly isDefault = computed(() => this.look.code() === START_CODE);
  protected readonly command = computed(() => {
    const code = this.isDefault() ? null : this.look.code();
    if (this.target() === 'existing') return `${IVORIE} apply ${code ?? 'default'}`;
    return code ? `${IVORIE} init --theme ${code}` : `${IVORIE} init`;
  });

  /** The screens to judge a look on: the wall, or a whole page from projects/blocks. */
  protected readonly screens = [
    { value: 'wall', label: 'Wall' },
    { value: 'dashboard-01', label: 'Dashboard' },
    { value: 'login-03', label: 'Sign in' },
    { value: 'sidebar-07', label: 'App shell' },
  ];
  protected readonly screen = signal('wall');
  protected readonly path = computed(() => (this.screen() === 'wall' ? 'preview/scene/wall' : `preview/block/${this.screen()}`));

  protected readonly themeNote = computed(() => {
    const t = this.look.preset().theme;
    return THEME_LIST.find((x) => x.name === t)?.note ?? '';
  });
  protected readonly themeLabel = computed(() => THEME_LIST.find((x) => x.name === this.look.preset().theme)?.label ?? this.look.preset().theme);

  /** Compare: your look on the left, another theme on the right of a divider. */
  protected readonly compare = signal(false);
  /** The theme to compare with; null follows the theme after yours. */
  private readonly picked = signal<ThemeName | null>(null);
  protected readonly other = computed<ThemeName>(() => {
    const mine = this.look.themeName();
    const pick = this.picked();
    if (pick && pick !== mine) return pick;
    return THEME_ORDER[(THEME_ORDER.indexOf(mine ?? THEME_ORDER[0]) + 1) % THEME_ORDER.length];
  });
  protected readonly otherThemes = computed(() => THEME_ORDER.filter((t) => t !== this.look.themeName()).map((name) => ({ name, label: THEME_INFO[name].label })));
  protected readonly otherLabel = computed(() => THEME_INFO[this.other()].label);
  protected readonly otherCode = computed(() => encodePreset(THEMES[this.other()]));
  protected setOther(name: ThemeName): void {
    this.picked.set(name);
  }
  /** Where the divider sits, in percent of the frame. */
  protected readonly split = signal(50);
  private readonly frames = viewChild<ElementRef<HTMLElement>>('frames');

  protected nudge(event: KeyboardEvent): void {
    const step = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    this.split.update((x) => Math.min(90, Math.max(10, x + step)));
  }

  /** Drags the divider. Pointer capture keeps the moves coming while the pointer is over a frame. */
  protected drag(event: PointerEvent): void {
    const box = this.frames()?.nativeElement;
    const handle = event.currentTarget as HTMLElement;
    if (!box) return;
    handle.setPointerCapture?.(event.pointerId);
    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      this.split.set(Math.round(Math.min(90, Math.max(10, ((e.clientX - r.left) / r.width) * 100))));
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  }

  /** Both frames show the same part of the page: a scroll in one scrolls the other. */
  private syncCompareScroll(): void {
    afterRenderEffect((onCleanup) => {
      if (!this.compare()) return;
      const frames = [...(this.frames()?.nativeElement.querySelectorAll('iframe') ?? [])];
      if (frames.length < 2) return;
      let busy = false;
      const follow = (from: HTMLIFrameElement, to: HTMLIFrameElement) => () => {
        if (busy) return;
        busy = true;
        try {
          to.contentWindow?.scrollTo(from.contentWindow?.scrollX ?? 0, from.contentWindow?.scrollY ?? 0);
        } catch {
          // A frame that is not ready yet: the next scroll syncs it.
        }
        requestAnimationFrame(() => (busy = false));
      };
      const pairs = [follow(frames[0], frames[1]), follow(frames[1], frames[0])];
      const hook = () =>
        frames.forEach((f, i) => {
          try {
            f.contentWindow?.addEventListener('scroll', pairs[i]);
          } catch {
            // Not loaded yet: its load event hooks it.
          }
        });
      hook();
      frames.forEach((f) => f.addEventListener('load', hook));
      onCleanup(() =>
        frames.forEach((f, i) => {
          f.removeEventListener('load', hook);
          try {
            f.contentWindow?.removeEventListener('scroll', pairs[i]);
          } catch {
            // The frame is gone.
          }
        }),
      );
    });
  }

  /** The fields you changed from the theme you picked, in rail order. */
  protected readonly changes = computed(() => {
    const t = this.look.themeName();
    if (!t) return [];
    const base = THEMES[t];
    const p = this.look.preset();
    return CHANGE_FIELDS.filter(([key]) => p[key] !== base[key]).map(([key, label]) => ({ key, label, value: cap(p[key]) }));
  });
  protected undo(key: keyof Preset): void {
    const t = this.look.themeName();
    if (t) this.look.set({ [key]: THEMES[t][key] });
  }

  protected readonly shortcuts = [
    { key: 'T', label: 'Next theme' },
    { key: 'D', label: 'Dark or light mode' },
    { key: 'S', label: 'Shuffle the look' },
    { key: 'C', label: 'Copy the init command' },
    { key: '?', label: 'Show these shortcuts' },
  ];
  private readonly dialog = inject(IvDialog);
  private readonly keysDialog = viewChild.required<TemplateRef<unknown>>('keysDialog');
  private readonly destroyRef = inject(DestroyRef);
  protected openKeys(): void {
    this.dialog.open(this.keysDialog());
  }

  /** Single-key shortcuts on the page. Never while typing, never with a modifier, never inside a dialog. */
  private listenForKeys(): void {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('input:not([type="radio"]), textarea, select, [contenteditable], [role="dialog"], [role="listbox"]')) return;
      const act: Record<string, () => void> = {
        t: () => this.look.pickTheme(THEME_ORDER[(THEME_ORDER.indexOf(this.look.themeName() ?? THEME_ORDER[THEME_ORDER.length - 1]) + 1) % THEME_ORDER.length]),
        d: () => this.appearance.toggle(),
        s: () => this.shuffle(),
        c: () => void this.copyCommand(),
        '?': () => this.openKeys(),
      };
      const run = act[e.key.toLowerCase()];
      if (!run) return;
      e.preventDefault();
      run();
    };
    this.doc.addEventListener('keydown', onKey);
    this.destroyRef.onDestroy(() => this.doc.removeEventListener('keydown', onKey));
  }

  constructor() {
    afterNextRender(() => {
      const query = this.route.snapshot.queryParamMap;
      this.look.load(query.get('preset'));
      this.ready.set(true);
      this.listenForKeys();
    });
    this.syncCompareScroll();
    // The look lives in the URL, so a link shares it. The default look has no query.
    effect(() => {
      const preset = this.isDefault() ? null : this.look.code();
      if (!this.ready()) return;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { preset },
        replaceUrl: true,
      });
    });
  }

  protected reset(): void {
    this.look.load(null);
  }

  /** The URL already holds the preset. */
  protected readonly commandCopied = signal(false);

  /** The panel's main action: the command that installs this exact setup. */
  protected async copyCommand(): Promise<void> {
    try {
      await this.doc.defaultView!.navigator.clipboard.writeText(this.command());
      this.commandCopied.set(true);
      setTimeout(() => this.commandCopied.set(false), 1500);
    } catch {
      // Clipboard blocked: the command is shown above the button, selectable.
    }
  }

  protected async copyLink(): Promise<void> {
    try {
      const win = this.doc.defaultView!;
      await win.navigator.clipboard.writeText(win.location.href);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 1500);
    } catch {
      // Clipboard blocked: the link is in the address bar.
    }
  }

  /** A random style, base color, accent, chart color, radius and fonts. The icon set stays. Never the look already showing. */
  shuffle(random: () => number = Math.random): void {
    const any = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];
    const fonts = FONTS.map((f) => f.name);
    const before = this.look.code();
    for (let i = 0; i < 10 && this.look.code() === before; i++) {
      this.look.set({
        theme: any(PICKABLE_THEMES).name,
        baseColor: any(BASE_COLORS).name,
        // Half the time the base color's own ink, so plain looks still come up.
        accent: random() < 0.5 ? 'base' : any(ACCENTS).name,
        chartColor: random() < 0.5 ? 'accent' : any(ACCENTS).name,
        radius: any(Object.keys(RADII)),
        font: any(['system', ...fonts]),
        // Half the time the headings keep the body font.
        fontHeading: random() < 0.5 ? 'inherit' : any(fonts),
      });
    }
  }
}
