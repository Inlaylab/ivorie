// The nav. Point the urls at your routes: they are relative to the route that shows this block.
export interface NavLink {
  title: string
  url: string
}

export interface NavSection {
  title: string
  url: string
  items: NavLink[]
}

export const versions = ['1.0.1', '1.1.0-alpha', '2.0.0-beta1']

export const navMain: NavSection[] = [
  {
    title: 'Getting Started',
    url: 'getting-started',
    items: [
      { title: 'Installation', url: 'installation' },
      { title: 'Project Structure', url: 'project-structure' },
    ],
  },
  {
    title: 'Build Your Application',
    url: 'build-your-application',
    items: [
      { title: 'Routing', url: 'routing' },
      { title: 'Data Fetching', url: 'data-fetching' },
      { title: 'Rendering', url: 'rendering' },
      { title: 'Caching', url: 'caching' },
      { title: 'Styling', url: 'styling' },
      { title: 'Optimizing', url: 'optimizing' },
      { title: 'Configuring', url: 'configuring' },
      { title: 'Testing', url: 'testing' },
      { title: 'Authentication', url: 'authentication' },
      { title: 'Deploying', url: 'deploying' },
      { title: 'Upgrading', url: 'upgrading' },
      { title: 'Examples', url: 'examples' },
    ],
  },
  {
    title: 'API Reference',
    url: 'api-reference',
    items: [
      { title: 'Components', url: 'components' },
      { title: 'File Conventions', url: 'file-conventions' },
      { title: 'Functions', url: 'functions' },
      { title: 'next.config.js Options', url: 'next-config-js-options' },
      { title: 'CLI', url: 'cli' },
      { title: 'Edge Runtime', url: 'edge-runtime' },
    ],
  },
  {
    title: 'Architecture',
    url: 'architecture',
    items: [
      { title: 'Accessibility', url: 'accessibility' },
      { title: 'Fast Refresh', url: 'fast-refresh' },
      { title: 'Next.js Compiler', url: 'next-js-compiler' },
      { title: 'Supported Browsers', url: 'supported-browsers' },
      { title: 'Turbopack', url: 'turbopack' },
    ],
  },
  {
    title: 'Community',
    url: 'community',
    items: [
      { title: 'Contribution Guide', url: 'contribution-guide' },
    ],
  },
]
