import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Item { title: string; when: string }
interface DigestProps {
  dateLabel?: string
  quote?: string
  today?: Item[]
  bills?: Item[]
  celebrations?: Item[]
  appLink?: string
}

const Group = ({ title, items }: { title: string; items?: Item[] }) =>
  items && items.length ? (
    <Section style={{ margin: '0 0 20px' }}>
      <Text style={h2}>{title}</Text>
      {items.map((i, n) => (
        <Text key={n} style={row}>
          <span style={when}>{i.when}</span> · {i.title}
        </Text>
      ))}
    </Section>
  ) : null

const MorningDigest = ({ dateLabel, quote, today, bills, celebrations, appLink }: DigestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your planner for {dateLabel ?? 'today'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Curated Planner · Morning ritual</Text>
        <Heading style={h1}>Good morning ☀️</Heading>
        <Text style={text}>{dateLabel}</Text>
        {quote && <Text style={quoteStyle}>“{quote}”</Text>}
        <Group title="Today" items={today} />
        <Group title="Bills due soon" items={bills} />
        <Group title="Celebrations this week" items={celebrations} />
        {appLink && (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={appLink} style={button}>Open today's planner</Button>
          </Section>
        )}
        <Text style={footer}>
          You get this because morning reminders are on. Turn them off any time in Settings → Reminders.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MorningDigest,
  subject: (d: Record<string, any>) => `Your planner for ${d.dateLabel ?? 'today'}`,
  displayName: 'Morning digest',
  previewData: {
    dateLabel: 'Monday, September 28',
    quote: 'Small steps every day.',
    today: [{ title: 'Dentist', when: 'Today' }],
    bills: [{ title: 'Electric (120)', when: 'Wed, Sep 30' }],
    celebrations: [{ title: 'Mom — Birthday', when: 'Fri, Oct 2' }],
    appLink: 'https://brandedbydigital.com/app',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '28px 24px', maxWidth: '560px', margin: '0 auto' }
const eyebrow = { fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#5a7363', margin: '0 0 8px' }
const h1 = { fontSize: '26px', color: '#2d3a32', margin: '0 0 4px', fontWeight: 'normal' }
const h2 = { fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#5a7363', margin: '0 0 8px', fontWeight: 'bold' }
const text = { fontSize: '15px', color: '#555555', margin: '0 0 16px' }
const quoteStyle = { fontSize: '15px', fontStyle: 'italic', color: '#5a7363', margin: '0 0 24px' }
const row = { fontSize: '15px', color: '#333333', margin: '0 0 6px', lineHeight: '1.5' }
const when = { color: '#5a7363', fontWeight: 'bold' }
const button = {
  backgroundColor: '#5a7363', color: '#ffffff', padding: '14px 28px', borderRadius: '6px',
  textDecoration: 'none', fontSize: '15px', display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#999999', margin: '28px 0 0' }
