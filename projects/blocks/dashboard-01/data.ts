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

/** Daily visitors by device, 90 days up to 2024-06-30 (UTC dates). Replace with your data. */
// A type, not an interface: chart rows need an index signature.
export type Visit = { date: string; desktop: number; mobile: number }

export const visitors: Visit[] = [
  { date: '2024-04-02', desktop: 97, mobile: 180 },
  { date: '2024-04-03', desktop: 167, mobile: 120 },
  { date: '2024-04-04', desktop: 242, mobile: 260 },
  { date: '2024-04-05', desktop: 373, mobile: 290 },
  { date: '2024-04-06', desktop: 301, mobile: 340 },
  { date: '2024-04-07', desktop: 245, mobile: 180 },
  { date: '2024-04-08', desktop: 409, mobile: 320 },
  { date: '2024-04-09', desktop: 59, mobile: 110 },
  { date: '2024-04-10', desktop: 261, mobile: 190 },
  { date: '2024-04-11', desktop: 327, mobile: 350 },
  { date: '2024-04-12', desktop: 292, mobile: 210 },
  { date: '2024-04-13', desktop: 342, mobile: 380 },
  { date: '2024-04-14', desktop: 137, mobile: 220 },
  { date: '2024-04-15', desktop: 120, mobile: 170 },
  { date: '2024-04-16', desktop: 138, mobile: 190 },
  { date: '2024-04-17', desktop: 446, mobile: 360 },
  { date: '2024-04-18', desktop: 364, mobile: 410 },
  { date: '2024-04-19', desktop: 243, mobile: 180 },
  { date: '2024-04-20', desktop: 89, mobile: 150 },
  { date: '2024-04-21', desktop: 137, mobile: 200 },
  { date: '2024-04-22', desktop: 224, mobile: 170 },
  { date: '2024-04-23', desktop: 138, mobile: 230 },
  { date: '2024-04-24', desktop: 387, mobile: 290 },
  { date: '2024-04-25', desktop: 215, mobile: 250 },
  { date: '2024-04-26', desktop: 75, mobile: 130 },
  { date: '2024-04-27', desktop: 383, mobile: 420 },
  { date: '2024-04-28', desktop: 122, mobile: 180 },
  { date: '2024-04-29', desktop: 315, mobile: 240 },
  { date: '2024-04-30', desktop: 454, mobile: 380 },
  { date: '2024-05-01', desktop: 165, mobile: 220 },
  { date: '2024-05-02', desktop: 293, mobile: 310 },
  { date: '2024-05-03', desktop: 247, mobile: 190 },
  { date: '2024-05-04', desktop: 385, mobile: 420 },
  { date: '2024-05-05', desktop: 481, mobile: 390 },
  { date: '2024-05-06', desktop: 498, mobile: 520 },
  { date: '2024-05-07', desktop: 388, mobile: 300 },
  { date: '2024-05-08', desktop: 149, mobile: 210 },
  { date: '2024-05-09', desktop: 227, mobile: 180 },
  { date: '2024-05-10', desktop: 293, mobile: 330 },
  { date: '2024-05-11', desktop: 335, mobile: 270 },
  { date: '2024-05-12', desktop: 197, mobile: 240 },
  { date: '2024-05-13', desktop: 197, mobile: 160 },
  { date: '2024-05-14', desktop: 448, mobile: 490 },
  { date: '2024-05-15', desktop: 473, mobile: 380 },
  { date: '2024-05-16', desktop: 338, mobile: 400 },
  { date: '2024-05-17', desktop: 499, mobile: 420 },
  { date: '2024-05-18', desktop: 315, mobile: 350 },
  { date: '2024-05-19', desktop: 235, mobile: 180 },
  { date: '2024-05-20', desktop: 177, mobile: 230 },
  { date: '2024-05-21', desktop: 82, mobile: 140 },
  { date: '2024-05-22', desktop: 81, mobile: 120 },
  { date: '2024-05-23', desktop: 252, mobile: 290 },
  { date: '2024-05-24', desktop: 294, mobile: 220 },
  { date: '2024-05-25', desktop: 201, mobile: 250 },
  { date: '2024-05-26', desktop: 213, mobile: 170 },
  { date: '2024-05-27', desktop: 420, mobile: 460 },
  { date: '2024-05-28', desktop: 233, mobile: 190 },
  { date: '2024-05-29', desktop: 78, mobile: 130 },
  { date: '2024-05-30', desktop: 340, mobile: 280 },
  { date: '2024-05-31', desktop: 178, mobile: 230 },
  { date: '2024-06-01', desktop: 178, mobile: 200 },
  { date: '2024-06-02', desktop: 470, mobile: 410 },
  { date: '2024-06-03', desktop: 103, mobile: 160 },
  { date: '2024-06-04', desktop: 439, mobile: 380 },
  { date: '2024-06-05', desktop: 88, mobile: 140 },
  { date: '2024-06-06', desktop: 294, mobile: 250 },
  { date: '2024-06-07', desktop: 323, mobile: 370 },
  { date: '2024-06-08', desktop: 385, mobile: 320 },
  { date: '2024-06-09', desktop: 438, mobile: 480 },
  { date: '2024-06-10', desktop: 155, mobile: 200 },
  { date: '2024-06-11', desktop: 92, mobile: 150 },
  { date: '2024-06-12', desktop: 492, mobile: 420 },
  { date: '2024-06-13', desktop: 81, mobile: 130 },
  { date: '2024-06-14', desktop: 426, mobile: 380 },
  { date: '2024-06-15', desktop: 307, mobile: 350 },
  { date: '2024-06-16', desktop: 371, mobile: 310 },
  { date: '2024-06-17', desktop: 475, mobile: 520 },
  { date: '2024-06-18', desktop: 107, mobile: 170 },
  { date: '2024-06-19', desktop: 341, mobile: 290 },
  { date: '2024-06-20', desktop: 408, mobile: 450 },
  { date: '2024-06-21', desktop: 169, mobile: 210 },
  { date: '2024-06-22', desktop: 317, mobile: 270 },
  { date: '2024-06-23', desktop: 480, mobile: 530 },
  { date: '2024-06-24', desktop: 132, mobile: 180 },
  { date: '2024-06-25', desktop: 141, mobile: 190 },
  { date: '2024-06-26', desktop: 434, mobile: 380 },
  { date: '2024-06-27', desktop: 448, mobile: 490 },
  { date: '2024-06-28', desktop: 149, mobile: 200 },
  { date: '2024-06-29', desktop: 103, mobile: 160 },
  { date: '2024-06-30', desktop: 446, mobile: 400 },
]
