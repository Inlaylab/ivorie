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

export const user = { name: 'Leo Martin', email: 'leo@northwind.shop', initials: 'LM' }

export const teams = [
  { name: 'Northwind', logo: lucideShoppingBag, plan: 'Store' },
  { name: 'Northwind Outlet', logo: lucideStar, plan: 'Store' },
  { name: 'Northwind Trade', logo: lucideBuilding2, plan: 'Wholesale' },
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
