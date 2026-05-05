/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as plannerPurchase } from './planner-purchase.tsx'
import { template as coverPackPurchase } from './cover-pack-purchase.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'planner-purchase': plannerPurchase,
  'cover-pack-purchase': coverPackPurchase,
}
