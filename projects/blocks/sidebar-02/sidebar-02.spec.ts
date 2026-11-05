import { describeSidebarBlock } from '../testing/sidebar-block'
import { Sidebar02, meta } from './sidebar-02'

describeSidebarBlock({ name: 'sidebar-02', meta, page: Sidebar02, links: 26, active: { url: 'data-fetching', label: 'Data Fetching' } })
