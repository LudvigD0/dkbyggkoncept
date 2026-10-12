import { HeaderClient } from './Component.client'
import type { SiteData } from '@/site/types'
export function Header({ data }: { data: SiteData }) {
  return <HeaderClient data={data} />
}
