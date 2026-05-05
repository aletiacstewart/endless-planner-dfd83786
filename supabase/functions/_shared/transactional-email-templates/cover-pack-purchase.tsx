import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Endless Planner'

interface PackEntry { packId: string; code: string }
interface CoverPackPurchaseProps {
  packCodes?: PackEntry[]
  origin?: string
}

const CoverPackPurchaseEmail = ({ packCodes = [], origin = '' }: CoverPackPurchaseProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your new cover & icon packs are ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your cover packs are ready 🎨</Heading>
        <Text style={text}>
          Thanks for your purchase! Tap each unlock link below on the device(s) where you'd like to use the new cover.
          Each pack includes the cover plus a matching icon set that re-themes every page in your planner.
        </Text>
        {packCodes.map(({ packId, code }) => {
          const link = `${origin}/unlock?code=${code}`
          return (
            <Section key={packId} style={packBox}>
              <Text style={packName}>{packId.replace(/-/g, ' ')}</Text>
              <Text style={codeLine}>
                Code: <strong>{code}</strong>
              </Text>
              <Text style={linkLine}>
                <a href={link} style={linkStyle}>Unlock on this device</a>
              </Text>
            </Section>
          )
        })}
        <Text style={text}>
          Switch covers anytime in Settings → Cover & Theme. Each pack works on up to 5 devices.
        </Text>
        <Text style={footer}>— The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CoverPackPurchaseEmail,
  subject: 'Your new cover packs are ready 🎨',
  displayName: 'Cover pack purchase',
  previewData: {
    origin: 'https://endless-planner.lovable.app',
    packCodes: [
      { packId: 'sparrow-lotus', code: 'ABCD-EFGH-IJKLMNOP' },
      { packId: 'midnight-iris-stars', code: 'WXYZ-1234-56789ABC' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#111111', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
const packBox = {
  background: '#f5f5f5',
  borderRadius: '8px',
  padding: '14px 16px',
  margin: '12px 0',
}
const packName = { fontSize: '14px', color: '#111111', fontWeight: 'bold', margin: '0 0 6px', textTransform: 'capitalize' as const }
const codeLine = { fontSize: '13px', color: '#222222', margin: '0 0 4px', letterSpacing: '0.5px' }
const linkLine = { fontSize: '13px', margin: '0' }
const linkStyle = { color: '#1f6feb', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
