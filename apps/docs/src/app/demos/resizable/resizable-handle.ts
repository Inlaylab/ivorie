import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_RESIZABLE_IMPORTS } from '@inlaylab/ivorie/resizable';

@Component({
  selector: 'demo-resizable-handle',
  imports: [IV_RESIZABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-resizable-panel-group class="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]">
      <iv-resizable-panel defaultSize="25" minSize="15">
        <div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Sidebar</span></div>
      </iv-resizable-panel>
      <iv-resizable-handle [withHandle]="true" />
      <iv-resizable-panel defaultSize="75">
        <div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Content</span></div>
      </iv-resizable-panel>
    </iv-resizable-panel-group>
  `,
})
export default class ResizableHandleDemo {}
