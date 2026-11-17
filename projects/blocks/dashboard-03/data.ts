import {
  lucideBuilding2,
  lucideGlobe,
  lucideSettings2,
  lucideShoppingBag,
  lucideShoppingCart,
  lucideStar,
  lucideUsers,
  lucideWallet,
} from '@ng-icons/lucide'

// Demo data. Point the urls at your routes: they are relative to the route that shows this block.
export interface NavItem {
  title: string
  url: string
  /** An svg string from @ng-icons. */
  icon: string
  items?: { title: string; url: string }[]
}

// The Ivorie mark, one color: it takes the text color, so it follows the theme.
export const ivorieLogo =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="17 16 129 129" fill="currentColor"><path d="M55.04 18.86c2.6-1.53 5.21-1.53 7.81 0l64.56 38c2.32 1.36 3.47 3.41 3.47 6.13v49.59c0 2.04-.87 2.55-2.6 1.53L84.43 88.3c-1.45-.85-2.17-2.13-2.17-3.83V36.63c0-1.02-.43-1.28-1.3-.77L34.3 63.33c-1.45.85-2.17.42-2.17-1.28V35.41c0-2.04.87-3.58 2.61-4.6z"/><path d="M32.13 85.05c0-2.04.87-3.58 2.6-4.6L68.92 60.32c.87-.51 1.3-.26 1.3.77v33.67c0 1.7.72 2.98 2.17 3.83l38.84 22.86c1.74 1.02 1.74 2.04 0 3.07l-30.77 18.11c-2.6 1.53-5.21 1.53-7.82 0L35.16 120.57c-2.02-1.19-3.04-2.98-3.04-5.37z"/></svg>'

export const user = { name: 'Ivorie', email: 'hello@example.com', initials: 'IV' }

export const teams = [
  { name: 'Ivorie', logo: ivorieLogo, plan: 'Store' },
  { name: 'Ivorie Outlet', logo: lucideStar, plan: 'Store' },
  { name: 'Ivorie Trade', logo: lucideBuilding2, plan: 'Wholesale' },
]

export const navMain: NavItem[] = [
  {
    title: 'Sales',
    url: 'sales',
    icon: lucideWallet,
    items: [
      { title: 'Orders', url: 'orders' },
      { title: 'Invoices', url: 'invoices' },
      { title: 'Refunds', url: 'refunds' },
    ],
  },
  {
    title: 'Products',
    url: 'products',
    icon: lucideShoppingCart,
    items: [
      { title: 'Catalog', url: 'catalog' },
      { title: 'Inventory', url: 'inventory' },
      { title: 'Pricing', url: 'pricing' },
    ],
  },
  {
    title: 'Customers',
    url: 'customers',
    icon: lucideUsers,
    items: [
      { title: 'All customers', url: 'all-customers' },
      { title: 'Segments', url: 'segments' },
      { title: 'Reviews', url: 'reviews' },
    ],
  },
  {
    title: 'Settings',
    url: 'settings',
    icon: lucideSettings2,
    items: [
      { title: 'General', url: 'general' },
      { title: 'Payments', url: 'payments' },
      { title: 'Shipping', url: 'shipping' },
      { title: 'Taxes', url: 'taxes' },
    ],
  },
]

export const channels = [
  { name: 'Online Store', url: 'online-store', icon: lucideGlobe },
  { name: 'Retail', url: 'retail', icon: lucideShoppingBag },
  { name: 'Wholesale', url: 'wholesale', icon: lucideBuilding2 },
]

// Chart rows are types, not interfaces: a chart row needs an index signature.

/** Revenue this month by channel. `fill` points at the channel's config color. */
export type ChannelRevenue = { channel: string; revenue: number; fill: string }

export const revenueByChannel: ChannelRevenue[] = [
  { channel: 'online', revenue: 18640, fill: 'var(--color-online)' },
  { channel: 'retail', revenue: 11290, fill: 'var(--color-retail)' },
  { channel: 'wholesale', revenue: 8120, fill: 'var(--color-wholesale)' },
  { channel: 'marketplace', revenue: 4870, fill: 'var(--color-marketplace)' },
  { channel: 'social', revenue: 2311, fill: 'var(--color-social)' },
]

/** This month's revenue against its target. */
export const goal = { revenue: 45231, target: 60000 }

/** Top products this month by revenue. */
export type ProductRevenue = { product: string; revenue: number }

export const topProducts: ProductRevenue[] = [
  { product: 'Linen Shirt', revenue: 6820 },
  { product: 'Canvas Tote', revenue: 5410 },
  { product: 'Wool Beanie', revenue: 4370 },
  { product: 'Leather Belt', revenue: 3960 },
  { product: 'Cotton Socks', revenue: 2580 },
  { product: 'Silk Scarf', revenue: 2140 },
]

/** The latest orders. */
export interface Sale {
  name: string
  email: string
  initials: string
  amount: number
}

export const recentSales: Sale[] = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', initials: 'OM', amount: 1999 },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', initials: 'JL', amount: 39 },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', initials: 'IN', amount: 299 },
  { name: 'William Kim', email: 'will@email.com', initials: 'WK', amount: 99 },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', initials: 'SD', amount: 39 },
]
