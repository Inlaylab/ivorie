import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IV_SELECT_PICKER_IMPORTS } from '@ivorie/ui/extras/select-picker';

interface Team {
  id: string;
  name: string;
  about: string;
}

@Component({
  selector: 'demo-select-picker-description-column',
  imports: [FormsModule, IV_SELECT_PICKER_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-72">
      <iv-select-picker
        [items]="teams"
        [valueFn]="id"
        [labelFn]="name"
        [descriptionFn]="about"
        [(ngModel)]="selected"
        placeholder="Select teams"
        dialogTitle="Select teams"
        valueColumnHeader="Team"
        descriptionColumnHeader="About"
      />
    </div>
  `,
})
export default class SelectPickerDescriptionColumnDemo {
  readonly teams: Team[] = [
    { id: 'eng', name: 'Engineering', about: 'Builds the product' },
    { id: 'design', name: 'Design', about: 'Shapes the experience' },
    { id: 'support', name: 'Support', about: 'Helps customers' },
  ];
  readonly selected = signal<string[]>(['eng']);

  readonly id = (team: Team) => team.id;
  readonly name = (team: Team) => team.name;
  readonly about = (team: Team) => team.about;
}
