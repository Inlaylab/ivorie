import { TestBed } from '@angular/core/testing';
import { IV_CONFIG } from '@inlaylab/ivorie/core';
import { IvToastService } from '@inlaylab/ivorie/toast';
import { AppModule } from './app.module';
import { App } from './app';

// One root data-slot per entry (core is checked through IV_CONFIG).
const SLOTS = [
  'accordion',
  'alert',
  'alert-dialog-trigger',
  'aspect-ratio',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'button-group',
  'calendar',
  'card',
  'checkbox',
  'collapsible',
  'combobox',
  'dialog-trigger',
  'dropdown-menu',
  'empty',
  'field',
  'hover-card',
  'input',
  'item',
  'kbd',
  'native-select',
  'pagination',
  'progress',
  'radio-group',
  'scroll-area',
  'select',
  'separator',
  'sidebar',
  'skeleton',
  'spinner',
  'switch',
  'table',
  'tabs',
  'toast',
  'tooltip',
  'select-picker',
];

describe('module-smoke App', () => {
  it('renders every entry from one NgModule', async () => {
    const error = vi.spyOn(console, 'error');
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    TestBed.inject(IvToastService).show('Saved', 'success');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const missing = SLOTS.filter((s) => !el.querySelector(`[data-slot="${s}"]`));
    expect(missing).toEqual([]);
    expect(TestBed.inject(IV_CONFIG).tooltipDelay).toBe(300);
    expect(error).not.toHaveBeenCalled();
  });
});
