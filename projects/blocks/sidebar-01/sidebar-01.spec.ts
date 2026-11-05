import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar01, meta } from './sidebar-01'

describeSidebarBlock({ name: 'sidebar-01', meta, page: Sidebar01, links: 25, active: { url: 'data-fetching', label: 'Data Fetching' } })
