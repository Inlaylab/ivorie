import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IV_ALERT_DIALOG_IMPORTS } from '@inlaylab/ivorie/alert-dialog';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';
import { IvSeparator } from '@inlaylab/ivorie/separator';

/** Playground scene: a checkout form beside an order summary, with a confirm step. */
@Component({
  selector: 'docs-scene-checkout',
  imports: [
    IV_ALERT_DIALOG_IMPORTS,
    IvButton,
    IV_CARD_IMPORTS,
    IV_FIELD_IMPORTS,
    IV_INPUT_IMPORTS,
    IV_NATIVE_SELECT_IMPORTS,
    IV_RADIO_GROUP_IMPORTS,
    IvSeparator,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container block' },
  template: `
    <div class="mx-auto grid max-w-5xl items-start gap-4 @3xl:grid-cols-[minmax(0,1fr)_20rem]">
      <iv-card>
        <iv-card-header>
          <iv-card-title class="cn-font-heading text-xl">Checkout</iv-card-title>
          <iv-card-description>Ships in 2 to 4 days. You can change the address until then.</iv-card-description>
        </iv-card-header>
        <iv-card-content>
          <iv-field-group>
            <iv-field>
              <label ivLabel for="co-email">Email</label>
              <input ivInput id="co-email" type="email" value="ada@acme.dev" />
            </iv-field>
            <div class="grid gap-4 @lg:grid-cols-2">
              <iv-field>
                <label ivLabel for="co-name">Full name</label>
                <input ivInput id="co-name" value="Ada Lovelace" />
              </iv-field>
              <iv-field>
                <label ivLabel for="co-country">Country</label>
                <iv-native-select>
                  <select ivNativeSelect id="co-country">
                    <option ivNativeSelectOption value="gb">United Kingdom</option>
                    <option ivNativeSelectOption value="de">Germany</option>
                    <option ivNativeSelectOption value="in">India</option>
                    <option ivNativeSelectOption value="us">United States</option>
                  </select>
                </iv-native-select>
              </iv-field>
            </div>
            <iv-field>
              <label ivLabel for="co-address">Address</label>
              <input ivInput id="co-address" value="12 St James's Square, London" />
            </iv-field>
            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium" id="co-delivery">Delivery</span>
              <iv-radio-group [value]="delivery()" (valueChange)="delivery.set($event ?? 'standard')" aria-labelledby="co-delivery" class="grid gap-2 @lg:grid-cols-2">
                @for (d of deliveries; track d.value) {
                  <label class="has-[[data-checked]]:border-primary flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border p-3 text-sm">
                    <iv-radio-group-item [value]="d.value" class="mt-0.5" />
                    <span class="flex flex-1 flex-col gap-0.5">
                      <span class="font-medium">{{ d.label }}</span>
                      <span class="text-muted-foreground text-xs">{{ d.hint }}</span>
                    </span>
                    <span class="tabular-nums">{{ d.price ? '$' + d.price : 'Free' }}</span>
                  </label>
                }
              </iv-radio-group>
            </div>
          </iv-field-group>
        </iv-card-content>
      </iv-card>

      <iv-card>
        <iv-card-header>
          <iv-card-title>Order summary</iv-card-title>
        </iv-card-header>
        <iv-card-content class="flex flex-col gap-3 text-sm">
          @for (item of items; track item.name) {
            <div class="flex justify-between gap-4">
              <span>{{ item.name }} <span class="text-muted-foreground">× {{ item.qty }}</span></span>
              <span class="tabular-nums">\${{ item.price * item.qty }}</span>
            </div>
          }
          <iv-separator />
          <div class="text-muted-foreground flex justify-between"><span>Delivery</span><span class="tabular-nums">\${{ shipping() }}</span></div>
          <div class="flex justify-between font-medium"><span>Total</span><span class="tabular-nums">\${{ total() }}</span></div>
        </iv-card-content>
        <iv-card-footer>
          <button ivButton class="w-full" [ivAlertDialogTrigger]="confirm">Pay \${{ total() }}</button>
        </iv-card-footer>
      </iv-card>
    </div>

    <ng-template #confirm>
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
export class SceneCheckout {
  protected readonly items = [
    { name: 'Desk lamp', qty: 1, price: 64 },
    { name: 'Linen notebook', qty: 2, price: 18 },
  ];
  protected readonly deliveries = [
    { value: 'standard', label: 'Standard', hint: '2 to 4 days', price: 0 },
    { value: 'express', label: 'Express', hint: 'Next working day', price: 12 },
  ];
  protected readonly delivery = signal('standard');
  protected readonly shipping = computed(() => this.deliveries.find((d) => d.value === this.delivery())!.price);
  protected readonly total = computed(() => this.items.reduce((s, i) => s + i.price * i.qty, 0) + this.shipping());
}
