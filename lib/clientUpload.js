'use client';

export async function uploadToCloudinary(file, useCase = 'editor-image') {
  if (!file) throw new Error('No file');
  const sigRes = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useCase }),
  });
  const sigJson = await sigRes.json();
  if (!sigJson.success) throw new Error(sigJson.error || 'Signature failed');
  const { signature, timestamp, params, cloudName, apiKey } = sigJson.data;

  const resourceType = file.type?.startsWith('image/') ? 'image' : 'raw';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', apiKey);
  fd.append('timestamp', String(timestamp));
  fd.append('signature', signature);
  Object.entries(params).forEach(([k, v]) => {
    if (k !== 'timestamp' && v != null) fd.append(k, String(v));
  });

  const upRes = await fetch(url, { method: 'POST', body: fd });
  if (!upRes.ok) {
    const t = await upRes.text();
    throw new Error(`Upload failed: ${t.slice(0, 200)}`);
  }
  return upRes.json(); // { secure_url, public_id, bytes, format, ... }
}
