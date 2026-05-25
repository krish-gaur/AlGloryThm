import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'AlGloryThm <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATIONS_EMAIL || 'admin@alglorythm.com';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// =============== BRAND EMAIL TEMPLATE ===============
function wrap({ title, previewText, bodyHtml, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#03050B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;">
  <div style="display:none;max-height:0;overflow:hidden;">${previewText || ''}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#03050B;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(180deg,#0A0E1A 0%,#050810 100%);border:1px solid rgba(0,212,255,0.18);border-radius:16px;overflow:hidden;box-shadow:0 0 40px rgba(0,180,255,0.15);">
        <tr><td style="padding:28px 32px;background:linear-gradient(135deg,rgba(0,212,255,0.08) 0%,transparent 60%);border-bottom:1px solid rgba(255,255,255,0.06);">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:36px;">
              <div style="width:32px;height:32px;background:linear-gradient(135deg,#00D4FF,#0066FF);transform:rotate(45deg);border-radius:8px;"></div>
            </td>
            <td style="padding-left:12px;font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.02em;">
              Al<span style="background:linear-gradient(135deg,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;color:transparent;">Glory</span>Thm
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px;">${bodyHtml}
          ${ctaText && ctaUrl ? `<div style="margin-top:32px;text-align:center;"><a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#00D4FF 0%,#0066FF 100%);color:#03050B;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 8px 24px -4px rgba(0,180,255,0.4);">${ctaText}</a></div>` : ''}
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:rgba(255,255,255,0.45);text-align:center;">
          You received this email because you interacted with AlGloryThm.<br/>
          © 2025 AlGloryThm • hello@alglorythm.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function safeSend(opts) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipping email:', opts.subject);
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send(opts);
    if (result.error) console.error('[email] Send error:', result.error);
    return result;
  } catch (e) {
    console.error('[email] Exception:', e?.message);
    return { error: e?.message };
  }
}

// =============== LEAD EMAILS ===============
export async function sendLeadEmails(lead) {
  const customerBody = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#fff;">Thanks, ${lead.firstName}.</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      We received your message about <strong style="color:#00D4FF;">${(lead.serviceType || '').replace(/_/g,' ')}</strong>. Our team will reach out within 24 hours with a discovery call link and a tailored next-step proposal.
    </p>
    <div style="margin-top:24px;padding:20px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.2);border-radius:12px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#00D4FF;margin-bottom:8px;">What happens next</div>
      <ol style="margin:0;padding-left:20px;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.8;">
        <li>You\u2019ll get a calendar link within 24h</li>
        <li>We run a 30\u2011min scoping call</li>
        <li>You receive a written proposal in 48h</li>
      </ol>
    </div>`;

  const adminBody = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#fff;">\ud83d\ude80 New Lead</h1>
    <p style="margin:0 0 20px;color:rgba(255,255,255,0.7);font-size:14px;">A new lead just dropped in the AlGloryThm pipeline.</p>
    <table cellpadding="8" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="color:rgba(255,255,255,0.5);width:120px;">Name</td><td style="color:#fff;">${lead.firstName} ${lead.lastName || ''}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">Email</td><td style="color:#00D4FF;">${lead.email}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">Phone</td><td style="color:#fff;">${lead.phone || '\u2014'}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">Company</td><td style="color:#fff;">${lead.company || '\u2014'}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">Service</td><td style="color:#fff;">${(lead.serviceType || '').replace(/_/g,' ')}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">Budget</td><td style="color:#fff;">${lead.budget || '\u2014'}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">Timeline</td><td style="color:#fff;">${lead.timeline || '\u2014'}</td></tr>
    </table>
    ${lead.message ? `<div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.04);border-radius:10px;"><div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Message</div><div style="color:#fff;white-space:pre-wrap;font-size:14px;line-height:1.6;">${lead.message}</div></div>` : ''}`;

  return Promise.all([
    safeSend({
      from: FROM,
      to: [lead.email],
      subject: 'We received your message \u2014 AlGloryThm',
      html: wrap({ title: 'Thanks for reaching out', previewText: 'Our team will reach out within 24 hours.', bodyHtml: customerBody, ctaText: 'Read our research', ctaUrl: `${BASE_URL}/blog` }),
    }),
    safeSend({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject: `\ud83d\udd25 New lead: ${lead.firstName} ${lead.lastName || ''} (${(lead.serviceType || '').replace(/_/g,' ')})`,
      html: wrap({ title: 'New lead', previewText: `${lead.email} \u2022 ${lead.company || 'No company'}`, bodyHtml: adminBody, ctaText: 'Open admin dashboard', ctaUrl: `${BASE_URL}/admin` }),
    }),
  ]);
}

// =============== EVENT REGISTRATION ===============
export async function sendEventRegistrationEmail(reg, event) {
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#fff;">You\u2019re in, ${reg.firstName || 'there'}!</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      Your spot at <strong style="color:#00D4FF;">${event?.title || 'the event'}</strong> is confirmed.
    </p>
    <div style="padding:20px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.2);border-radius:12px;margin-top:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#00D4FF;margin-bottom:12px;">Event details</div>
      <div style="color:#fff;font-size:14px;line-height:1.8;">
        \ud83d\udcc5 <strong>When:</strong> ${event?.date ? new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'TBA'}<br/>
        \ud83d\udccd <strong>Where:</strong> ${event?.location || 'TBA'}<br/>
        \ud83c\udfaf <strong>Type:</strong> ${event?.eventType || 'Event'}
      </div>
    </div>
    <p style="margin-top:20px;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">We\u2019ll email you a reminder 24 hours before the event with joining instructions.</p>`;
  return safeSend({
    from: FROM,
    to: [reg.email],
    subject: `\u2705 Registered: ${event?.title || 'AlGloryThm event'}`,
    html: wrap({ title: 'Registration confirmed', previewText: `Your spot for ${event?.title || 'the event'} is confirmed.`, bodyHtml: body, ctaText: 'View all events', ctaUrl: `${BASE_URL}/#events` }),
  });
}

// =============== HACKATHON INVITE ===============
export async function sendHackathonInviteEmail({ email, inviteeName, teamName, organizerName, token, hackathonTitle }) {
  const confirmUrl = `${BASE_URL}/hackathons/confirm?token=${token}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#fff;">${inviteeName ? `Hi ${inviteeName},` : 'You\u2019re invited!'}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      <strong style="color:#00D4FF;">${organizerName}</strong> has invited you to join team <strong style="color:#fff;">${teamName}</strong> ${hackathonTitle ? `for <strong>${hackathonTitle}</strong>` : 'for an AlGloryThm hackathon'}.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.6);">
      Click the button below to accept the invitation and complete your profile. The link expires in 72 hours.
    </p>`;
  return safeSend({
    from: FROM,
    to: [email],
    subject: `\ud83d\ude80 Invite: Join team ${teamName} \u2014 ${hackathonTitle || 'AlGloryThm Hackathon'}`,
    html: wrap({ title: 'Hackathon invitation', previewText: `Join ${teamName} for the upcoming hackathon.`, bodyHtml: body, ctaText: 'Accept invitation', ctaUrl: confirmUrl }),
  });
}

// =============== WELCOME EMAIL ===============
export async function sendWelcomeEmail(user) {
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#fff;">Welcome to AlGloryThm, ${user.firstName || 'there'}!</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
      You\u2019re now part of a community building the next wave of AI-powered businesses. Here\u2019s what you can do next:
    </p>
    <ul style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.9;padding-left:20px;">
      <li>Browse upcoming <a href="${BASE_URL}/#events" style="color:#00D4FF;">events &amp; hackathons</a></li>
      <li>Read our latest <a href="${BASE_URL}/blog" style="color:#00D4FF;">research articles</a></li>
      <li>Book a discovery call with our team</li>
    </ul>`;
  return safeSend({
    from: FROM,
    to: [user.email],
    subject: 'Welcome to AlGloryThm \ud83d\ude80',
    html: wrap({ title: 'Welcome', previewText: 'Your AlGloryThm journey starts now.', bodyHtml: body, ctaText: 'Explore dashboard', ctaUrl: `${BASE_URL}/dashboard` }),
  });
}
