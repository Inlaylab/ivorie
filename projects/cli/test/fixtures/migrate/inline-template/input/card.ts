import { Component } from '@angular/core';
import { UI_CARD } from '@acme/ui/ui-card';

@Component({
  selector: 'app-card',
  imports: [UI_CARD],
  template: `<ui-card><ui-card-title>Hi</ui-card-title></ui-card><ui-button>Go</ui-button>`,
})
export class CardComponent {}
