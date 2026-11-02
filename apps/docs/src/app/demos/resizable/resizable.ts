import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_RESIZABLE_IMPORTS } from '@inlaylab/ivorie/resizable';

@Component({
  selector: 'demo-resizable',
  imports: [IV_RESIZABLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-resizable-panel-group class="max-w-md rounded-lg border md:min-w-[450px]">
      <iv-resizable-panel defaultSize="50">
        <div class="flex h-[200px] items-center justify-center p-6"><span class="font-semibold">One</span></div>
      </iv-resizable-panel>
      <iv-resizable-handle />
      <iv-resizable-panel defaultSize="50">
        <iv-resizable-panel-group orientation="vertical">
          <iv-resizable-panel defaultSize="25">
            <div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Two</span></div>
          </iv-resizable-panel>
          <iv-resizable-handle />
          <iv-resizable-panel defaultSize="75">
            <div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Three</span></div>
          </iv-resizable-panel>
        </iv-resizable-panel-group>
      </iv-resizable-panel>
    </iv-resizable-panel-group>
  `,
})
export default class ResizableDemo {}
