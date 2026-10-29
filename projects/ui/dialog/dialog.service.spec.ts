import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogCloseEvent, IvDialog } from './dialog.service';

@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p>Dialog body</p>` })
class TestDialogComponent {
}

describe('IvDialog — escape', () => {
    beforeEach(() => {
        vi.useFakeTimers({ advanceTimeDelta: 1, shouldAdvanceTime: true });
    });
    afterEach(() => {
        vi.useRealTimers();
    });
    let service: IvDialog;

    const pressEscape = (target: EventTarget = document.body) => {
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        target.dispatchEvent(event);
        return event;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IvDialog);
    });

    it('closes on ESC even when focus is outside the dialog', async () => {
        const ref = service.open(TestDialogComponent);
        const events: DialogCloseEvent[] = [];
        ref.afterClosed().subscribe(e => events.push(e));

        (document.activeElement as HTMLElement | null)?.blur();
        pressEscape();
        await vi.runAllTimersAsync();

        expect(events).toEqual([{ reason: 'escape', result: undefined }]);
    });

    it('stays open when disableEscapeClose is set', async () => {
        const ref = service.open(TestDialogComponent, { disableEscapeClose: true });
        const closeSpy = vi.spyOn(ref, 'close');

        pressEscape();

        expect(closeSpy).not.toHaveBeenCalled();
        ref.close();
        await vi.runAllTimersAsync();
    });

    it('ignores ESC already handled by an inner popup', async () => {
        const ref = service.open(TestDialogComponent);
        const closeSpy = vi.spyOn(ref, 'close');
        const inner = document.createElement('input');
        document.body.appendChild(inner);
        inner.addEventListener('keydown', e => e.preventDefault());

        pressEscape(inner);

        expect(closeSpy).not.toHaveBeenCalled();
        inner.remove();
        ref.close();
        await vi.runAllTimersAsync();
    });

    it('closes only the topmost dialog', async () => {
        const bottom = service.open(TestDialogComponent);
        const top = service.open(TestDialogComponent);
        const bottomSpy = vi.spyOn(bottom, 'close');
        const topSpy = vi.spyOn(top, 'close');

        pressEscape();

        expect(topSpy).toHaveBeenCalledWith(undefined, 'escape');
        expect(bottomSpy).not.toHaveBeenCalled();
        bottom.close();
        await vi.runAllTimersAsync();
    });
});
