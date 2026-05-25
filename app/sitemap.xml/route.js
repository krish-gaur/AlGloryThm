export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sitemap`, { cache: 'no-store' });
  const xml = await res.text();
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
