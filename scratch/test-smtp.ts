import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

async function testEmailDirectly() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log('SMTP Config:', { smtpHost, smtpPort, smtpUser, smtpPass: smtpPass ? '***' : 'MISSING' });

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('SMTP credentials missing from environment');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_ADDRESS || smtpUser,
      to: smtpUser, // send to self
      subject: 'AVEX CRM Email Test',
      html: '<h1>Email is working!</h1><p>This is a test email from AVEX CRM.</p>',
    });

    console.log('✅ Email sent! MessageId:', info.messageId);
  } catch (err: any) {
    console.error('❌ SMTP Error:', err.message);
    console.error('Full error:', err);
  }
}

// Load .env.local manually
const envPath = path.join(process.cwd(), 'apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
  console.log('Loaded .env.local');
}

testEmailDirectly();
