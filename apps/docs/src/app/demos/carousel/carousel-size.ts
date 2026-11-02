import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_CAROUSEL_IMPORTS } from '@inlaylab/ivorie/carousel';

@Component({
  selector: 'demo-carousel-size',
  imports: [IV_CAROUSEL_IMPORTS, IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-carousel class="w-full max-w-48 sm:max-w-xs md:max-w-sm" aria-label="Numbers">
      <iv-carousel-content>
        @for (n of slides; track n) {
          <iv-carousel-item class="basis-1/2 lg:basis-1/3">
            <div class="p-1">
              <iv-card>
                <iv-card-content class="flex aspect-square items-center justify-center p-6">
                  <span class="text-3xl font-semibold">{{ n }}</span>
                </iv-card-content>
              </iv-card>
            </div>
          </iv-carousel-item>
        }
      </iv-carousel-content>
      <button ivCarouselPrevious></button>
      <button ivCarouselNext></button>
    </iv-carousel>
  `,
})
export default class CarouselSizeDemo {
  readonly slides = [1, 2, 3, 4, 5];
}
