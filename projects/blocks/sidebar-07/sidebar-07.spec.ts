import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar07, meta } from './sidebar-07'

describeSidebarBlock({ name: 'sidebar-07', meta, page: Sidebar07, links: 17, active: { url: 'history', label: 'History' } })
