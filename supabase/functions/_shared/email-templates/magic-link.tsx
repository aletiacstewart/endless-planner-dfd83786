/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click the button below to log in to {siteName}. This link will expire
          shortly.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Log In
        </Button>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#f4f1e8',
  fontFamily: "Georgia, 'Times New Roman', serif",
  padding: '32px 12px',
}
const container = {
  padding: '36px 32px',
  maxWidth: '540px',
  backgroundColor: '#fcfbf7',
  border: '1px solid #dbe6e0',
  borderRadius: '16px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#064e3b',
  margin: '0 0 20px',
  letterSpacing: '0.2px',
}
const text = {
  fontSize: '14px',
  color: '#4a5a54',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: '#064e3b',
  color: '#fcfbf7',
  fontSize: '14px',
  border: '1px solid #064e3b',
  borderRadius: '10px',
  padding: '13px 24px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#8a8f8b', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #a9cfbc !important; color: #07291f !important; }
  }
  [data-ogsc] .dm-btn { background-color: #a9cfbc !important; color: #07291f !important; }
  [data-ogsb] .dm-btn { background-color: #a9cfbc !important; color: #07291f !important; }
`
