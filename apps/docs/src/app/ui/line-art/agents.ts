import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Next, 1.7: a coding agent asks the Ivorie MCP server, which reads llms.txt. */
@Component({
  selector: 'docs-line-agents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 360 160" width="100%" role="img" aria-label="An agent connects to the Ivorie MCP server, which reads the docs">
      <g class="fill-(--docs-pane-solid)" stroke="currentColor" stroke-width="1">
        <rect x="10" y="60" width="90" height="40" rx="20" />
        <rect x="135" y="60" width="90" height="40" rx="8" />
        <rect x="260" y="60" width="90" height="40" rx="8" />
      </g>
      <path class="docs-flow stroke-(--brand)" d="M100 80H135M225 80H260" fill="none" stroke-width="1.25" />
      <g class="font-mono" font-size="11" fill="currentColor" text-anchor="middle">
        <text x="55" y="84">agent</text><text x="180" y="84">mcp</text><text x="305" y="84">llms.txt</text>
      </g>
    </svg>
  `,
})
export class DocsLineAgents {}
