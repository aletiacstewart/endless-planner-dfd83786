import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Endless Planner'

interface PackCode { packId: string; code: string }

interface PlannerPurchaseProps {
  plannerId?: string
  installLink?: string
  unlockCode?: string
  amountTotal?: number   // in cents
  currency?: string
  packCodes?: PackCode[]
  purchaseDate?: string  // ISO
  receiptId?: string
}

function money(cents?: number, currency?: string) {
  if (typeof cents !== 'number' || !currency) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`
  }
}

function pretty(id?: string) {
  return id ? id.replace(/[-_]/g, ' ') : ''
}

const PlannerPurchaseEmail = ({
  plannerId,
  installLink,
  unlockCode,
  amountTotal,
  currency,
  packCodes = [],
  purchaseDate,
  receiptId,
}: PlannerPurchaseProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your planner is ready — receipt inside</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thanks for your purchase!</Heading>
        <Text style={text}>
          Your {plannerId ? <strong>{pretty(plannerId)}</strong> : 'planner'} is ready to use.
          Tap the button below on any device you'd like to install it on (up to 5 devices).
        </Text>
        {installLink && (
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={installLink} style={button}>Unlock my planner</Button>
          </Section>
        )}
        {unlockCode && (
          <Text style={codeBox}>
            Your unlock code: <strong>{unlockCode}</strong>
          </Text>
        )}

        <Hr style={hr} />
        <Heading as="h2" style={h2}>Receipt</Heading>
        {purchaseDate && (
          <Text style={meta}>Date: {new Date(purchaseDate).toLocaleDateString()}</Text>
        )}
        {receiptId && <Text style={meta}>Order: {receiptId}</Text>}

        <Section style={lineItems}>
          {plannerId && (
            <div style={row}>
              <span>{pretty(plannerId)} planner</span>
            </div>
          )}
          {packCodes.map((p) => (
            <div key={p.packId} style={row}>
              <span>{pretty(p.packId)} cover pack</span>
            </div>
          ))}
          {typeof amountTotal === 'number' && currency && (
            <div style={{ ...row, borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8, fontWeight: 'bold' }}>
              <span>Total paid</span>
              <span>{money(amountTotal, currency)}</span>
            </div>
          )}
        </Section>

        <Text style={text}>
          Keep this email — you can re-use the link or code to set up additional devices later.
        </Text>
        <Text style={footer}>— The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PlannerPurchaseEmail,
  subject: 'Your planner is ready 🎉',
  displayName: 'Planner purchase confirmation',
  previewData: {
    plannerId: 'wellness_journey_planner',
    installLink: 'https://endless-planner.lovable.app/unlock?code=ABCD-EFGH-IJKLMNOP',
    unlockCode: 'ABCD-EFGH-IJKLMNOP',
    amountTotal: 1999,
    currency: 'usd',
    purchaseDate: new Date().toISOString(),
    receiptId: 'cs_test_abc123',
    packCodes: [{ packId: 'forget-me-nots-ladybugs', code: 'WXYZ-1234-5678ABCD' }],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#111111', margin: '0 0 16px' }
const h2 = { fontSize: '16px', fontWeight: 'bold', color: '#111111', margin: '24px 0 8px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
const meta = { fontSize: '13px', color: '#666666', margin: '2px 0' }
const button = {
  backgroundColor: '#111111',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 'bold',
  display: 'inline-block',
}
const codeBox = {
  fontSize: '14px',
  color: '#111111',
  background: '#f5f5f5',
  padding: '12px 16px',
  borderRadius: '6px',
  textAlign: 'center' as const,
  letterSpacing: '1px',
  margin: '16px 0',
}
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const lineItems = { fontSize: '14px', color: '#333333', margin: '8px 0 16px' }
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '4px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
