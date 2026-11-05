import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar04, meta } from './sidebar-04'

describeSidebarBlock({ name: 'sidebar-04', meta, page: Sidebar04, links: 32, active: { url: 'data-fetching', label: 'Data Fetching' } })
