/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#064e3b',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#8a8f8b', margin: '30px 0 0' }
