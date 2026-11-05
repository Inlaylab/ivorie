import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar03, meta } from './sidebar-03'

describeSidebarBlock({ name: 'sidebar-03', meta, page: Sidebar03, links: 32, active: { url: 'data-fetching', label: 'Data Fetching' } })
