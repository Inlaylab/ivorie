// Proves NgModule use: every IV_*_IMPORTS array plus the standalone classes of the other entries.
// Arrays are spread: they are readonly tuples, and NgModule imports takes only plain arrays.
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IvorieModule } from '@inlaylab/ivorie/core';
import { IV_ACCORDION_IMPORTS } from '@inlaylab/ivorie/accordion';
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert';
import { IV_ALERT_DIALOG_IMPORTS } from '@inlaylab/ivorie/alert-dialog';
import { IvAspectRatio } from '@inlaylab/ivorie/aspect-ratio';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IV_BREADCRUMB_IMPORTS } from '@inlaylab/ivorie/breadcrumb';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_BUTTON_GROUP_IMPORTS } from '@inlaylab/ivorie/button-group';
import { IvCalendar } from '@inlaylab/ivorie/calendar';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CHART_IMPORTS } from '@inlaylab/ivorie/chart';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';
import { IV_COLLAPSIBLE_IMPORTS } from '@inlaylab/ivorie/collapsible';
import { IV_COMBOBOX_IMPORTS } from '@inlaylab/ivorie/combobox';
import { IV_CONTEXT_MENU_IMPORTS } from '@inlaylab/ivorie/context-menu';
import { IV_MENUBAR_IMPORTS } from '@inlaylab/ivorie/menubar';
import { IV_NAVIGATION_MENU_IMPORTS } from '@inlaylab/ivorie/navigation-menu';
import { IV_POPOVER_IMPORTS } from '@inlaylab/ivorie/popover';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { IvSlider } from '@inlaylab/ivorie/slider';
import { IvToggle } from '@inlaylab/ivorie/toggle';
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group';
import { IV_CAROUSEL_IMPORTS } from '@inlaylab/ivorie/carousel';
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command';
import { IV_DRAWER_IMPORTS } from '@inlaylab/ivorie/drawer';
import { IvIcon } from '@inlaylab/ivorie/icon';
import { IV_INPUT_OTP_IMPORTS } from '@inlaylab/ivorie/input-otp';
import { IV_RESIZABLE_IMPORTS } from '@inlaylab/ivorie/resizable';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';
import { IV_DROPDOWN_MENU_IMPORTS } from '@inlaylab/ivorie/dropdown-menu';
import { IV_EMPTY_IMPORTS } from '@inlaylab/ivorie/empty';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_HOVER_CARD_IMPORTS } from '@inlaylab/ivorie/hover-card';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_ITEM_IMPORTS } from '@inlaylab/ivorie/item';
import { IV_KBD_IMPORTS } from '@inlaylab/ivorie/kbd';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';
import { IV_PAGINATION_IMPORTS } from '@inlaylab/ivorie/pagination';
import { IvProgress } from '@inlaylab/ivorie/progress';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';
import { IV_SCROLL_AREA_IMPORTS } from '@inlaylab/ivorie/scroll-area';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IvSeparator } from '@inlaylab/ivorie/separator';
import { IV_SIDEBAR_IMPORTS } from '@inlaylab/ivorie/sidebar';
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';
import { IvSpinner } from '@inlaylab/ivorie/spinner';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';
import { IV_DATA_TABLE_IMPORTS } from '@inlaylab/ivorie/data-table';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';
import { IvToast, IvToastContainer, provideIvToast } from '@inlaylab/ivorie/toast';
import { IV_TOOLTIP_IMPORTS } from '@inlaylab/ivorie/tooltip';
import { IV_SELECT_PICKER_IMPORTS } from '@inlaylab/ivorie/extras/select-picker';
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
    ...IV_CHART_IMPORTS,
    ...IV_COLLAPSIBLE_IMPORTS,
    ...IV_COMBOBOX_IMPORTS,
    ...IV_DIALOG_IMPORTS,
    ...IV_DROPDOWN_MENU_IMPORTS,
    ...IV_FIELD_IMPORTS,
    ...IV_HOVER_CARD_IMPORTS,
    ...IV_INPUT_IMPORTS,
    ...IV_ITEM_IMPORTS,
    ...IV_EMPTY_IMPORTS,
    ...IV_KBD_IMPORTS,
    ...IV_NATIVE_SELECT_IMPORTS,
    ...IV_CONTEXT_MENU_IMPORTS,
    ...IV_MENUBAR_IMPORTS,
    ...IV_NAVIGATION_MENU_IMPORTS,
    ...IV_POPOVER_IMPORTS,
    ...IV_SHEET_IMPORTS,
    ...IV_TOGGLE_GROUP_IMPORTS,
    IvSlider,
    IvToggle,
    ...IV_CAROUSEL_IMPORTS,
    ...IV_COMMAND_IMPORTS,
    ...IV_DRAWER_IMPORTS,
    IvIcon,
    ...IV_INPUT_OTP_IMPORTS,
    ...IV_RESIZABLE_IMPORTS,
    ...IV_PAGINATION_IMPORTS,
    ...IV_RADIO_GROUP_IMPORTS,
    ...IV_SCROLL_AREA_IMPORTS,
    ...IV_SELECT_IMPORTS,
    ...IV_SIDEBAR_IMPORTS,
    ...IV_TABLE_IMPORTS,
    ...IV_DATA_TABLE_IMPORTS,
    ...IV_TABS_IMPORTS,
    ...IV_TOOLTIP_IMPORTS,
    ...IV_SELECT_PICKER_IMPORTS,
    IvAspectRatio,
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
