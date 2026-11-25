import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const SHOPMONKEY_API_BASE = process.env.SHOPMONKEY_API_BASE || 'https://api.shopmonkey.cloud/v3';
const SHOPMONKEY_LOCATION_ID = process.env.SHOPMONKEY_LOCATION_ID || 'f3173cde-af0b-453f-93bd-1dbf406b64d0';
const SHOP_TIMEZONE = 'America/Toronto';

// Toronto UTC offset ("-05:00"/"-04:00") for the given instant.
function torontoOffset(instant) {
  const tzName = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(instant).find((p) => p.type === 'timeZoneName')?.value;
  return !tzName || tzName === 'GMT' ? 'Z' : tzName.slice(3);
}

// Build an ISO datetime for a YYYY-MM-DD + HH:MM pair interpreted in the shop timezone.
function shopDateTimeISO(dateStr, timeStr, addMinutes = 0) {
  const probe = new Date(`${dateStr}T${timeStr}:00Z`);
  const offset = torontoOffset(probe);
  const instant = new Date(`${dateStr}T${timeStr}:00${offset}`);
  if (!addMinutes) return `${dateStr}T${timeStr}:00${offset}`;
  const shifted = new Date(instant.getTime() + addMinutes * 60000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(shifted).reduce((acc, x) => ((acc[x.type] = x.value), acc), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${torontoOffset(shifted)}`;
}

// Create a Shopmonkey appointment for the preferred date/time on a customer record.
async function createShopmonkeyAppointment({ headers, customer, service, date, time, summary }) {
  const body = {
    name: service && service !== 'Choose' ? service : 'Website appointment request',
    color: 'blue',
    customerId: customer.id,
    customerEmailId: customer.emails?.[0]?.id,
    customerPhoneNumberId: customer.phoneNumbers?.[0]?.id,
    locationId: SHOPMONKEY_LOCATION_ID,
    note: summary,
    attributionSource: 'AppointmentScheduler',
    origin: 'AppointmentScheduler',
    sendConfirmation: false,
    sendReminder: false,
  };
  if (time) {
    body.startDate = shopDateTimeISO(date, time);
    body.endDate = shopDateTimeISO(date, time, 60);
    body.allDay = false;
  } else {
    body.startDate = shopDateTimeISO(date, '08:00');
    body.endDate = shopDateTimeISO(date, '17:00');
    body.allDay = true;
  }
  const res = await fetch(`${SHOPMONKEY_API_BASE}/appointment`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.data?.id) {
    throw new Error(`Shopmonkey create appointment failed (${res.status}): ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data.data.id;
}

// Best-effort dedupe + create a lead customer in Shopmonkey.
// Attribution (gclid/UTMs) is stored on the customer record so the ad click
// can be tied back to the eventual order/payment inside Shopmonkey.
async function createShopmonkeyLead({ name, email, phone, service, date, time, message, attribution }) {
  const apiKey = process.env.SHOPMONKEY_API_KEY;
  if (!apiKey) return { skipped: true };

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const trimmed = (name || '').trim();
  const firstSpace = trimmed.indexOf(' ');
  const firstName = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
  const lastName = firstSpace === -1 ? '(web lead)' : trimmed.slice(firstSpace + 1).trim();

  const summary = [
    'Lead: rapidfixauto.ca',
    service && service !== 'Choose' ? `Service: ${service}` : null,
    date ? `Preferred: ${date}${time ? ` ${time}` : ''}` : null,
    attribution?.utm_source ? `Source: ${attribution.utm_source}${attribution.utm_medium ? `/${attribution.utm_medium}` : ''}` : null,
    attribution?.utm_campaign ? `Campaign: ${attribution.utm_campaign}` : null,
    attribution?.gclid ? `Google Ads click (gclid: ${attribution.gclid})` : null,
    attribution?.landingPage ? `Landing page: ${attribution.landingPage}` : null,
    message ? `Notes: ${message}` : null,
  ].filter(Boolean).join(' | ');

  // Dedupe: reuse an existing customer matched by email when possible.
  let customer = null;
  let existing = false;
  try {
    const searchRes = await fetch(`${SHOPMONKEY_API_BASE}/customer/email/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ emails: [email] }),
    });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      customer = searchData?.data?.[0] || null;
      existing = !!customer;
    }
  } catch {
    // Fall through to create
  }

  if (!customer) {
    const createRes = await fetch(`${SHOPMONKEY_API_BASE}/customer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customerType: 'Customer',
        firstName: firstName || 'Website',
        lastName: lastName || 'Lead',
        note: summary,
        locationId: SHOPMONKEY_LOCATION_ID,
        emails: [{ email, primary: true }],
        ...(phone ? { phoneNumbers: [{ number: phone, primary: true }] } : {}),
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`Shopmonkey create customer failed (${createRes.status}): ${text}`);
    }

    const created = await createRes.json();
    if (!created?.data?.id) {
      throw new Error(`Shopmonkey create customer failed: ${JSON.stringify(created).slice(0, 300)}`);
    }
    customer = created.data;
  }

  const result = { customerId: customer.id, existing };

  // Book the preferred slot as a Shopmonkey appointment when a date was given.
  // Staff still confirm it manually in Shopmonkey — nothing is auto-confirmed.
  if (date) {
    try {
      result.appointmentId = await createShopmonkeyAppointment({
        headers, customer, service, date, time, summary,
      });
    } catch (err) {
      console.error('Shopmonkey appointment create failed:', err);
      result.appointmentError = true;
    }
  }

  return result;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, service, date, time, message, attribution } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Check if env vars are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing EMAIL_USER or EMAIL_PASS environment variables');
      return NextResponse.json(
        { success: false, message: 'Server configuration error: Email credentials not set.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport(
      process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          }
        : {
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          }
    );

    const appointmentInfo = [];
    if (phone) appointmentInfo.push(`Phone: ${phone}`);
    if (service && service !== 'Choose') appointmentInfo.push(`Service: ${service}`);
    if (date) appointmentInfo.push(`Date: ${date}`);
    if (time) appointmentInfo.push(`Time: ${time}`);

    const attributionLines = [];
    if (attribution?.utm_source) attributionLines.push(`Source: ${attribution.utm_source}${attribution.utm_medium ? ` / ${attribution.utm_medium}` : ''}`);
    if (attribution?.utm_campaign) attributionLines.push(`Campaign: ${attribution.utm_campaign}`);
    if (attribution?.utm_term) attributionLines.push(`Keyword: ${attribution.utm_term}`);
    if (attribution?.gclid) attributionLines.push(`Google Ads click: yes`);
    if (attribution?.landingPage) attributionLines.push(`Landing page: ${attribution.landingPage}`);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"RapidFix Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        ...appointmentInfo,
        ...(attributionLines.length ? ['', '--- Ad Attribution ---', ...attributionLines] : []),
        '',
        `Message:`,
        message,
      ].join('\n'),
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${service && service !== 'Choose' ? `<p><strong>Service:</strong> ${service}</p>` : ''}
        ${date ? `<p><strong>Preferred Date:</strong> ${date}</p>` : ''}
        ${time ? `<p><strong>Preferred Time:</strong> ${time}</p>` : ''}
        ${attributionLines.length ? `<hr/><p><strong>Ad Attribution:</strong><br/>${attributionLines.join('<br/>')}</p>` : ''}
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    // Send notification email + push the lead into Shopmonkey in parallel.
    // Email is the source of truth; Shopmonkey failure never blocks the lead.
    const [emailResult, shopmonkeyResult] = await Promise.allSettled([
      transporter.sendMail(mailOptions),
      createShopmonkeyLead({ name, email, phone, service, date, time, message, attribution }),
    ]);

    if (emailResult.status === 'rejected') {
      throw emailResult.reason;
    }
    if (shopmonkeyResult.status === 'rejected') {
      console.error('Shopmonkey lead push failed:', shopmonkeyResult.reason);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully!',
        shopmonkey: shopmonkeyResult.status === 'fulfilled' ? shopmonkeyResult.value : { error: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email.' },
      { status: 500 }
    );
  }
}
