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

/** Documents for the table. Replace with your data. */
export interface Document {
  id: string
  header: string
  type: string
  status: 'Done' | 'In Process'
  target: number
  limit: number
  reviewer: string
}

export const documents: Document[] = [
  { id: '1', header: 'Cover page', type: 'Cover page', status: 'In Process', target: 18, limit: 5, reviewer: 'Eddie Lake' },
  { id: '2', header: 'Table of contents', type: 'Table of contents', status: 'Done', target: 29, limit: 24, reviewer: 'Eddie Lake' },
  { id: '3', header: 'Executive summary', type: 'Narrative', status: 'Done', target: 10, limit: 13, reviewer: 'Eddie Lake' },
  { id: '4', header: 'Technical approach', type: 'Narrative', status: 'Done', target: 27, limit: 23, reviewer: 'Jamik Tashpulatov' },
  { id: '5', header: 'Design', type: 'Narrative', status: 'In Process', target: 2, limit: 16, reviewer: 'Jamik Tashpulatov' },
  { id: '6', header: 'Capabilities', type: 'Narrative', status: 'In Process', target: 20, limit: 8, reviewer: 'Jamik Tashpulatov' },
  { id: '7', header: 'Integration with existing systems', type: 'Narrative', status: 'In Process', target: 19, limit: 21, reviewer: 'Jamik Tashpulatov' },
  { id: '8', header: 'Innovation and Advantages', type: 'Narrative', status: 'Done', target: 25, limit: 26, reviewer: 'Assign reviewer' },
  { id: '9', header: "Overview of EMR's Innovative Solutions", type: 'Technical content', status: 'Done', target: 7, limit: 23, reviewer: 'Assign reviewer' },
  { id: '10', header: 'Advanced Algorithms and Machine Learning', type: 'Narrative', status: 'Done', target: 30, limit: 28, reviewer: 'Assign reviewer' },
  { id: '11', header: 'Adaptive Communication Protocols', type: 'Narrative', status: 'Done', target: 9, limit: 31, reviewer: 'Assign reviewer' },
  { id: '12', header: 'Advantages Over Current Technologies', type: 'Narrative', status: 'Done', target: 12, limit: 0, reviewer: 'Assign reviewer' },
  { id: '13', header: 'Past Performance', type: 'Narrative', status: 'Done', target: 22, limit: 33, reviewer: 'Assign reviewer' },
  { id: '14', header: 'Customer Feedback and Satisfaction Levels', type: 'Narrative', status: 'Done', target: 15, limit: 34, reviewer: 'Assign reviewer' },
  { id: '15', header: 'Implementation Challenges and Solutions', type: 'Narrative', status: 'Done', target: 3, limit: 35, reviewer: 'Assign reviewer' },
  { id: '16', header: 'Security Measures and Data Protection Policies', type: 'Narrative', status: 'In Process', target: 6, limit: 36, reviewer: 'Assign reviewer' },
  { id: '17', header: 'Scalability and Future Proofing', type: 'Narrative', status: 'Done', target: 4, limit: 37, reviewer: 'Assign reviewer' },
  { id: '18', header: 'Cost-Benefit Analysis', type: 'Plain language', status: 'Done', target: 14, limit: 38, reviewer: 'Assign reviewer' },
  { id: '19', header: 'User Training and Onboarding Experience', type: 'Narrative', status: 'Done', target: 17, limit: 39, reviewer: 'Assign reviewer' },
  { id: '20', header: 'Future Development Roadmap', type: 'Narrative', status: 'Done', target: 11, limit: 40, reviewer: 'Assign reviewer' },
  { id: '21', header: 'System Architecture Overview', type: 'Technical content', status: 'In Process', target: 24, limit: 18, reviewer: 'Maya Johnson' },
  { id: '22', header: 'Risk Management Plan', type: 'Narrative', status: 'Done', target: 15, limit: 22, reviewer: 'Carlos Rodriguez' },
  { id: '23', header: 'Compliance Documentation', type: 'Legal', status: 'In Process', target: 31, limit: 27, reviewer: 'Sarah Chen' },
  { id: '24', header: 'API Documentation', type: 'Technical content', status: 'Done', target: 8, limit: 12, reviewer: 'Raj Patel' },
]
