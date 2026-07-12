import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Endless Planner'

interface WelcomeProps {
  ownerName?: string
  appLink?: string
}

const WelcomeEmail = ({ ownerName, appLink }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — your planner travels with you</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome{ownerName ? `, ${ownerName}` : ''}! 🌿</Heading>
        <Text style={text}>
          Thanks for signing in to {SITE_NAME}. Your account keeps your entries,
          cover, and unlocks safely synced across every device you use.
        </Text>
        <Text style={text}>
          A few things you can do right away:
        </Text>
        <ul style={list}>
          <li style={li}>Open the <strong>Daily Tracker</strong> to log today.</li>
          <li style={li}>Pick a new <strong>Cover &amp; Icon</strong> pack in Settings.</li>
          <li style={li}>Sign in on another device to see everything appear there too.</li>
        </ul>
        {appLink && (
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={appLink} style={button}>Open my planner</Button>
          </Section>
        )}
        <Text style={footer}>— The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Welcome to ${SITE_NAME} 🌿`,
  displayName: 'Welcome email',
  previewData: {
    ownerName: 'Jane',
    appLink: 'https://endless-planner.lovable.app/app',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#111111', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
const list = { paddingLeft: '20px', margin: '0 0 16px', color: '#444444', fontSize: '15px', lineHeight: '1.8' }
const li = { marginBottom: '4px' }
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
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
