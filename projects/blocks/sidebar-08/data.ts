import {
  lucideActivity,
  lucideBookOpen,
  lucideBot,
  lucideChartPie,
  lucideCommand,
  lucideFrame,
  lucideGalleryVerticalEnd,
  lucideLifeBuoy,
  lucideMap,
  lucideSend,
  lucideSettings2,
  lucideSquareTerminal,
} from '@ng-icons/lucide'

// Demo data. Point the urls at your routes: they are relative to the route that shows this block.
export interface NavItem {
  title: string
  url: string
  /** An svg string from @ng-icons. */
  icon: string
  items?: { title: string; url: string }[]
}

export const user = { name: 'shadcn', email: 'm@example.com', initials: 'CN' }

export const teams = [
  { name: 'Acme Inc', logo: lucideGalleryVerticalEnd, plan: 'Enterprise' },
  { name: 'Acme Corp.', logo: lucideActivity, plan: 'Startup' },
  { name: 'Evil Corp.', logo: lucideCommand, plan: 'Free' },
]

export const navMain: NavItem[] = [
  {
    title: 'Playground',
    url: 'playground',
    icon: lucideSquareTerminal,
    items: [
      { title: 'History', url: 'history' },
      { title: 'Starred', url: 'starred' },
      { title: 'Settings', url: 'playground-settings' },
    ],
  },
  {
    title: 'Models',
    url: 'models',
    icon: lucideBot,
    items: [
      { title: 'Genesis', url: 'genesis' },
      { title: 'Explorer', url: 'explorer' },
      { title: 'Quantum', url: 'quantum' },
    ],
  },
  {
    title: 'Documentation',
    url: 'documentation',
    icon: lucideBookOpen,
    items: [
      { title: 'Introduction', url: 'introduction' },
      { title: 'Get Started', url: 'get-started' },
      { title: 'Tutorials', url: 'tutorials' },
      { title: 'Changelog', url: 'changelog' },
    ],
  },
  {
    title: 'Settings',
    url: 'settings',
    icon: lucideSettings2,
    items: [
      { title: 'General', url: 'general' },
      { title: 'Team', url: 'team' },
      { title: 'Billing', url: 'billing' },
      { title: 'Limits', url: 'limits' },
    ],
  },
]

export const projects = [
  { name: 'Design Engineering', url: 'design-engineering', icon: lucideFrame },
  { name: 'Sales & Marketing', url: 'sales-marketing', icon: lucideChartPie },
  { name: 'Travel', url: 'travel', icon: lucideMap },
]

export const navSecondary = [
  { title: 'Support', url: 'support', icon: lucideLifeBuoy },
  { title: 'Feedback', url: 'feedback', icon: lucideSend },
]
