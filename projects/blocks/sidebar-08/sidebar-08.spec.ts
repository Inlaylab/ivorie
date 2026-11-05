import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar08, meta } from './sidebar-08'

describeSidebarBlock({ name: 'sidebar-08', meta, page: Sidebar08, links: 24, active: { url: 'history', label: 'History' } })
