import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar05, meta } from './sidebar-05'

describeSidebarBlock({ name: 'sidebar-05', meta, page: Sidebar05, links: 27, active: { url: 'data-fetching', label: 'Data Fetching' } })
