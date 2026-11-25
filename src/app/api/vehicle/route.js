import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SHOPMONKEY_API_BASE = process.env.SHOPMONKEY_API_BASE || 'https://api.shopmonkey.cloud/v3';

// Server-side proxy for Shopmonkey vehicle-catalog dropdowns so the
// API key never reaches the browser.
//
//   GET /api/vehicle?type=years
//   GET /api/vehicle?type=makes&year=2020
//   GET /api/vehicle?type=models&year=2020&makeId=76
//   GET /api/vehicle?type=submodels&year=2020&makeId=76&modelId=1013
export async function GET(req) {
  const apiKey = process.env.SHOPMONKEY_API_KEY;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const year = searchParams.get('year');
  const makeId = searchParams.get('makeId');
  const modelId = searchParams.get('modelId');
  const term = searchParams.get('term');

  // Unified vehicle search: VIN (auto-detected at 17 chars) or free-text
  // year/make/model. Proxies Shopmonkey's shared catalog search.
  if (type === 'search') {
    if (!term || term.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }
    try {
      const res = await fetch(`${SHOPMONKEY_API_BASE}/integration/vehicle/shared/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          locationId: process.env.SHOPMONKEY_LOCATION_ID || 'f3173cde-af0b-453f-93bd-1dbf406b64d0',
          term: term.trim(),
          stateprov: 'ON',
          region: 'CA',
        }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        return NextResponse.json(
          { success: false, message: data?.message || 'Vehicle search failed.' },
          { status: res.ok ? 502 : res.status }
        );
      }
      return NextResponse.json({ success: true, data: data?.data ?? [] });
    } catch {
      return NextResponse.json({ success: false, message: 'Vehicle search failed.' }, { status: 502 });
    }
  }

  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: 'Vehicle lookup is not configured.' },
      { status: 503 }
    );
  }

  let path;
  switch (type) {
    case 'years':
      path = '/vehicle/years/All/All';
      break;
    case 'makes':
      if (!year) return NextResponse.json({ success: false, message: 'year is required.' }, { status: 400 });
      path = `/vehicle/makes/All/All/${year}`;
      break;
    case 'models':
      if (!year || !makeId) return NextResponse.json({ success: false, message: 'year and makeId are required.' }, { status: 400 });
      path = `/vehicle/models/All/All/${year}/${makeId}`;
      break;
    case 'submodels':
      if (!year || !makeId || !modelId) return NextResponse.json({ success: false, message: 'year, makeId and modelId are required.' }, { status: 400 });
      path = `/vehicle/submodels/All/All/${year}/${makeId}/${modelId}`;
      break;
    default:
      return NextResponse.json({ success: false, message: 'Invalid lookup type.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SHOPMONKEY_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.success === false) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Vehicle lookup failed.' },
        { status: res.ok ? 502 : res.status }
      );
    }
    return NextResponse.json({ success: true, data: data?.data ?? [] });
  } catch {
    return NextResponse.json({ success: false, message: 'Vehicle lookup failed.' }, { status: 502 });
  }
}
