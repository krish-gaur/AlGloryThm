export async function GET() {
  const res = await fetch(
    'https://al-glory-thm.vercel.app/api/sitemap',
    { cache: 'no-store' }
  );

  const xml = await res.text();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}