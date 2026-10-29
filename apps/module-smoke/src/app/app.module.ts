// Proves NgModule use: every IV_*_IMPORTS array plus the standalone classes of the other entries.
// Arrays are spread: they are readonly tuples, and NgModule imports takes only plain arrays.
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IvorieModule } from '@ivorie/ui/core';
import { IV_ACCORDION_IMPORTS } from '@ivorie/ui/accordion';
import { IV_ALERT_IMPORTS } from '@ivorie/ui/alert';
import { IV_ALERT_DIALOG_IMPORTS } from '@ivorie/ui/alert-dialog';
import { IV_AVATAR_IMPORTS } from '@ivorie/ui/avatar';
import { IvBadge } from '@ivorie/ui/badge';
import { IV_BREADCRUMB_IMPORTS } from '@ivorie/ui/breadcrumb';
import { IvButton } from '@ivorie/ui/button';
import { IV_BUTTON_GROUP_IMPORTS } from '@ivorie/ui/button-group';
import { IvCalendar } from '@ivorie/ui/calendar';
import { IV_CARD_IMPORTS } from '@ivorie/ui/card';
import { IvCheckbox } from '@ivorie/ui/checkbox';
import { IV_COLLAPSIBLE_IMPORTS } from '@ivorie/ui/collapsible';
import { IV_COMBOBOX_IMPORTS } from '@ivorie/ui/combobox';
import { IV_DIALOG_IMPORTS } from '@ivorie/ui/dialog';
import { IV_DROPDOWN_MENU_IMPORTS } from '@ivorie/ui/dropdown-menu';
import { IV_FIELD_IMPORTS } from '@ivorie/ui/field';
import { IV_HOVER_CARD_IMPORTS } from '@ivorie/ui/hover-card';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';
import { IV_ITEM_IMPORTS } from '@ivorie/ui/item';
import { IV_PAGINATION_IMPORTS } from '@ivorie/ui/pagination';
import { IvProgress } from '@ivorie/ui/progress';
import { IV_RADIO_GROUP_IMPORTS } from '@ivorie/ui/radio-group';
import { IV_SCROLL_AREA_IMPORTS } from '@ivorie/ui/scroll-area';
import { IV_SELECT_IMPORTS } from '@ivorie/ui/select';
import { IvSeparator } from '@ivorie/ui/separator';
import { IV_SIDEBAR_IMPORTS } from '@ivorie/ui/sidebar';
import { IvSkeleton } from '@ivorie/ui/skeleton';
import { IvSpinner } from '@ivorie/ui/spinner';
import { IvSwitch } from '@ivorie/ui/switch';
import { IV_TABLE_IMPORTS } from '@ivorie/ui/table';
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';
import { IvToast, IvToastContainer, provideIvToast } from '@ivorie/ui/toast';
import { IV_TOOLTIP_IMPORTS } from '@ivorie/ui/tooltip';
import { IV_SELECT_PICKER_IMPORTS } from '@ivorie/ui/extras/select-picker';
import { App } from './app';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    IvorieModule.forRoot({ tooltipDelay: 300 }),
    ...IV_ACCORDION_IMPORTS,
    ...IV_ALERT_IMPORTS,
    ...IV_ALERT_DIALOG_IMPORTS,
    ...IV_AVATAR_IMPORTS,
    ...IV_BREADCRUMB_IMPORTS,
    ...IV_BUTTON_GROUP_IMPORTS,
    ...IV_CARD_IMPORTS,
    ...IV_COLLAPSIBLE_IMPORTS,
    ...IV_COMBOBOX_IMPORTS,
    ...IV_DIALOG_IMPORTS,
    ...IV_DROPDOWN_MENU_IMPORTS,
    ...IV_FIELD_IMPORTS,
    ...IV_HOVER_CARD_IMPORTS,
    ...IV_INPUT_IMPORTS,
    ...IV_ITEM_IMPORTS,
    ...IV_PAGINATION_IMPORTS,
    ...IV_RADIO_GROUP_IMPORTS,
    ...IV_SCROLL_AREA_IMPORTS,
    ...IV_SELECT_IMPORTS,
    ...IV_SIDEBAR_IMPORTS,
    ...IV_TABLE_IMPORTS,
    ...IV_TABS_IMPORTS,
    ...IV_TOOLTIP_IMPORTS,
    ...IV_SELECT_PICKER_IMPORTS,
    IvBadge,
    IvButton,
    IvCalendar,
    IvCheckbox,
    IvProgress,
    IvSeparator,
    IvSkeleton,
    IvSpinner,
    IvSwitch,
    IvToast,
    IvToastContainer,
  ],
  providers: [provideZonelessChangeDetection(), provideIvToast()],
  bootstrap: [App],
})
export class AppModule {}
