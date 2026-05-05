import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Endless Planner'

interface PlannerPurchaseProps {
  plannerId?: string
  installLink?: string
  unlockCode?: string
}

const PlannerPurchaseEmail = ({
  plannerId,
  installLink,
  unlockCode,
}: PlannerPurchaseProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your planner is ready — unlock it on any device</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thanks for your purchase!</Heading>
        <Text style={text}>
          Your {plannerId ? <strong>{plannerId.replace(/_/g, ' ')}</strong> : 'planner'} is ready to use.
          Tap the button below on any device you'd like to install it on (up to 5 devices).
        </Text>
        {installLink && (
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={installLink} style={button}>
              Unlock my planner
            </Button>
          </Section>
        )}
        {unlockCode && (
          <Text style={codeBox}>
            Your unlock code: <strong>{unlockCode}</strong>
          </Text>
        )}
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
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#111111', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
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
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
