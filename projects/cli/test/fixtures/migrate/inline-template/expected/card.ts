import { Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';

@Component({
  selector: 'app-card',
  imports: [IV_CARD_IMPORTS],
  template: `<iv-card><iv-card-title>Hi</iv-card-title></iv-card><button ivButton>Go</button>`,
})
export class CardComponent {}
