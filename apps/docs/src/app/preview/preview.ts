import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, afterNextRender, computed, inject, resource } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BLOCKS } from '../../generated/blocks';
import { PREVIEW_ICONS, PlaygroundLook } from '../playground/playground-look';
import { PlaygroundPreview } from '../playground/playground-preview';
import { SCENES } from '../playground/scenes';
import { SceneCheckout } from '../playground/scenes/checkout';
import { SceneSettings } from '../playground/scenes/settings';
import { SceneSignIn } from '../playground/scenes/sign-in';
import { SceneTeam } from '../playground/scenes/team';

/** What the parent page posts when its look changes. Same origin only. */
export interface LookMessage {
  type: 'ivorie-look';
  preset: string;
}

/** What the frame posts to its parent once it listens: the parent answers with its current look. */
export interface ReadyMessage {
  type: 'ivorie-preview-ready';
}

/**
 * One scene, alone in the page: the playground shows it in an iframe. The look goes on <body> and the
 * overlay container, in place of the site style, so nothing of the site leaks in. The first look comes
 * from `?preset=`, later ones from the parent by postMessage, dark mode by the storage event (Appearance).
 * Once it listens, it says so: a look picked while the frame was still loading is sent again.
 */
@Component({
  selector: 'docs-preview',
  imports: [NgComponentOutlet, PlaygroundPreview, SceneCheckout, SceneSettings, SceneSignIn, SceneTeam],
  providers: [PlaygroundLook, PREVIEW_ICONS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A block is a whole page: no stage padding or dots around it.
  host: { '[class]': "blockEntry() ? 'block min-h-svh bg-background' : 'docs-stage block min-h-svh p-4 sm:p-6 lg:p-8'" },
  template: `
    @switch (scene()) {
      @case ('dashboard') {
        <docs-playground-preview />
      }
      @case ('sign-in') {
        @defer (on immediate) {
          <docs-scene-sign-in />
        }
      }
      @case ('settings') {
        @defer (on immediate) {
          <docs-scene-settings />
        }
      }
      @case ('team') {
        @defer (on immediate) {
          <docs-scene-team />
        }
      }
      @case ('checkout') {
        @defer (on immediate) {
          <docs-scene-checkout />
        }
      }
      @default {
        @if (blockEntry()) {
          @if (block.value(); as b) {
            <ng-container *ngComponentOutlet="b" />
          }
        } @else {
          <p class="text-muted-foreground text-sm">Unknown preview.</p>
        }
      }
    }
  `,
})
export default class PreviewPage {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap.pipe(map((p) => ({ kind: p.get('kind'), name: p.get('name') }))));
  protected readonly scene = computed(() => {
    const p = this.params();
    return p?.kind === 'scene' ? SCENES.find((s) => s.value === p.name)?.value : undefined;
  });
  protected readonly blockEntry = computed(() => {
    const p = this.params();
    return p?.kind === 'block' ? BLOCKS.find((b) => b.name === p.name) : undefined;
  });
  /** The block's page component, loaded lazily (the server waits for it). */
  protected readonly block = resource({ params: () => this.blockEntry(), loader: ({ params }) => params.load() });

  constructor() {
    const look = inject(PlaygroundLook);
    const doc = inject(DOCUMENT);
    const overlays = inject(OverlayContainer);
    const destroy = inject(DestroyRef);
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
    afterNextRender(() => {
      look.attach(doc.body);
      look.attach(overlays.getContainerElement());
      look.load(this.route.snapshot.queryParamMap.get('preset'));
      const win = doc.defaultView!;
      const onMessage = (e: MessageEvent<Partial<LookMessage>>) => {
        if (e.origin !== win.location.origin || e.data?.type !== 'ivorie-look' || typeof e.data.preset !== 'string') return;
        look.load(e.data.preset);
      };
      win.addEventListener('message', onMessage);
      destroy.onDestroy(() => win.removeEventListener('message', onMessage));
      const ready: ReadyMessage = { type: 'ivorie-preview-ready' };
      win.parent.postMessage(ready, win.location.origin);
    });
  }
}
