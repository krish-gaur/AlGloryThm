import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendLeadEmails, sendEventRegistrationEmail, sendHackathonInviteEmail, sendWelcomeEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@alglorythm.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AlGlory@2025';

function jsonResponse(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return jsonResponse({ ok: true });
}

function getTokenFromReq(req) {
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function requireAdmin(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch {
    return null;
  }
}

async function seedBlogsIfEmpty(db) {
  const count = await db.collection('blogs').countDocuments();
  if (count > 0) return;
  const sampleBlogs = [
    {
      id: uuidv4(),
      title: 'The Rise of Autonomous AI Agents in Enterprise',
      slug: 'autonomous-ai-agents-enterprise',
      excerpt: 'How custom AI agents are reshaping operations, customer support, and decision-making across Fortune 500 companies in 2025.',
      content: 'Autonomous AI agents represent the next leap in enterprise automation. Unlike traditional rule-based bots, modern AI agents leverage large language models, tool-use, and persistent memory to plan, execute, and self-correct across complex workflows. In this deep dive, we explore the architecture patterns, ROI metrics, and deployment strategies that leading enterprises use to scale agentic systems safely.\n\nFrom Gartner research, 68% of enterprises will deploy at least one agentic AI system in production by Q4 2025. The economic impact: agents handle 40-70% of tier-1 support, reduce sales cycle by 22%, and unlock $4.4T in annual value globally.',
      thumbnail: 'https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
      author: 'Aryan Mehta',
      categories: ['AI Agents', 'Enterprise'],
      tags: ['agents', 'enterprise', 'automation'],
      published: true,
      views: 2847,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Building Production-Grade AI Workflows with LangGraph',
      slug: 'production-ai-workflows-langgraph',
      excerpt: 'A practical guide to architecting reliable, observable, and cost-efficient multi-step AI pipelines for high-scale environments.',
      content: 'LangGraph has emerged as the de-facto framework for orchestrating complex, stateful AI workflows. In this guide we walk through real-world patterns: human-in-the-loop checkpoints, parallel tool execution, retry policies, and cost-aware routing across model tiers.\n\nKey takeaways: design for observability first, treat prompts as code, and version your agent state machines like database migrations.',
      thumbnail: 'https://images.pexels.com/photos/17489153/pexels-photo-17489153.jpeg?auto=compress&cs=tinysrgb&w=1200',
      author: 'Sneha Kapoor',
      categories: ['Engineering', 'AI Infrastructure'],
      tags: ['langgraph', 'workflows', 'production'],
      published: true,
      views: 1903,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'AI Automation ROI: A CFO\u2019s Framework for 2025',
      slug: 'ai-automation-roi-cfo-framework',
      excerpt: 'How finance leaders should evaluate, budget, and govern AI automation investments \u2014 with a free spreadsheet template.',
      content: 'CFOs are under pressure to justify every AI dollar. Our framework breaks down four ROI levers: labor displacement, revenue acceleration, error reduction, and strategic optionality. We include benchmark multiples by industry and a phased capital allocation model.',
      thumbnail: 'https://images.unsplash.com/photo-1606778303077-3780ea8d5420?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
      author: 'Rohan Iyer',
      categories: ['Business', 'Strategy'],
      tags: ['roi', 'cfo', 'strategy'],
      published: true,
      views: 1245,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'From RPA to Agentic Automation: The Migration Playbook',
      slug: 'rpa-to-agentic-automation-playbook',
      excerpt: 'Legacy RPA bots are brittle. Here\u2019s how to phase them out and replace with adaptive AI agents without disrupting operations.',
      content: 'Most enterprises have hundreds of UiPath/Blue Prism bots that break weekly. We outline a 90-day migration plan to swap brittle RPA with agentic AI that adapts to UI changes, handles exceptions natively, and slashes maintenance costs by 80%.',
      thumbnail: 'https://images.pexels.com/photos/8386437/pexels-photo-8386437.jpeg?auto=compress&cs=tinysrgb&w=1200',
      author: 'Priya Nair',
      categories: ['AI Automation', 'Migration'],
      tags: ['rpa', 'agents', 'migration'],
      published: true,
      views: 892,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  await db.collection('blogs').insertMany(sampleBlogs);
}

async function seedEventsIfEmpty(db) {
  const count = await db.collection('events').countDocuments();
  if (count > 0) return;
  const events = [
    {
      id: uuidv4(),
      title: 'AI Builders Summit 2025',
      description: 'A two-day immersive conference featuring keynotes from leading AI researchers, hands-on workshops, and networking with top AI founders.',
      eventType: 'CONFERENCE',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 31).toISOString(),
      location: 'Bangalore, India',
      image: 'https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
      capacity: 500,
      published: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Hackathon: Build the Next AI Agent',
      description: '48-hour hackathon focused on building production-ready AI agents. \u20b95L prize pool, mentorship from industry leaders.',
      eventType: 'HACKATHON',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
      location: 'Hybrid \u2014 Online + Mumbai',
      image: 'https://images.pexels.com/photos/17489153/pexels-photo-17489153.jpeg?auto=compress&cs=tinysrgb&w=1200',
      capacity: 200,
      published: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Webinar: Scaling AI Automation in Finance',
      description: 'Live session with CFOs from leading fintechs on how they deployed AI agents to automate reconciliation, fraud detection, and reporting.',
      eventType: 'WEBINAR',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      location: 'Online',
      image: 'https://images.unsplash.com/photo-1606778303077-3780ea8d5420?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
      capacity: 1000,
      published: true,
      createdAt: new Date().toISOString(),
    },
  ];
  await db.collection('events').insertMany(events);
}

async function handleRequest(req, params) {
  const { path = [] } = params || {};
  const route = path.join('/');
  const method = req.method;
  const db = await getDb();

  // ---------- HEALTH ----------
  if (route === '' || route === 'health') {
    return jsonResponse({ success: true, message: 'AlGloryThm API is live', timestamp: new Date().toISOString() });
  }

  // ---------- LEADS ----------
  if (route === 'leads' && method === 'POST') {
    const body = await req.json();
    if (!body.email || !body.firstName) {
      return jsonResponse({ success: false, error: 'Email and first name are required' }, 400);
    }
    const lead = {
      id: uuidv4(),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName || '',
      phone: body.phone || '',
      company: body.company || '',
      serviceType: body.serviceType || 'CONSULTING',
      message: body.message || '',
      budget: body.budget || '',
      timeline: body.timeline || '',
      leadStatus: 'NEW',
      source: body.source || 'website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('leads').insertOne(lead);
    sendLeadEmails(lead).catch((e) => console.error('Lead email failed:', e?.message));
    return jsonResponse({ success: true, data: lead, message: 'Thank you! Our team will reach out within 24 hours.' }, 201);
  }

  if (route === 'leads' && method === 'GET') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const leads = await db.collection('leads').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return jsonResponse({ success: true, data: leads });
  }

  if (route.startsWith('leads/') && method === 'PATCH') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const id = route.split('/')[1];
    const body = await req.json();
    await db.collection('leads').updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
    return jsonResponse({ success: true });
  }

  // ---------- CONSULTATIONS ----------
  if (route === 'consultations' && method === 'POST') {
    const body = await req.json();
    const consult = {
      id: uuidv4(),
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    await db.collection('consultations').insertOne(consult);
    return jsonResponse({ success: true, data: consult, message: 'Consultation request received.' }, 201);
  }

  // ---------- BLOGS ----------
  if (route === 'blogs' && method === 'GET') {
    await seedBlogsIfEmpty(db);
    const blogs = await db.collection('blogs')
      .find({ published: true }, { projection: { _id: 0, content: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return jsonResponse({ success: true, data: blogs });
  }

  if (route.startsWith('blogs/') && method === 'GET') {
    const slug = route.split('/')[1];
    const blog = await db.collection('blogs').findOne({ slug }, { projection: { _id: 0 } });
    if (!blog) return jsonResponse({ success: false, error: 'Blog not found' }, 404);
    await db.collection('blogs').updateOne({ slug }, { $inc: { views: 1 } });
    return jsonResponse({ success: true, data: blog });
  }

  if (route === 'blogs' && method === 'POST') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const body = await req.json();
    const blog = {
      id: uuidv4(),
      ...body,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      views: 0,
      published: body.published ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('blogs').insertOne(blog);
    return jsonResponse({ success: true, data: blog }, 201);
  }

  // ---------- EVENTS ----------
  if (route === 'events' && method === 'GET') {
    await seedEventsIfEmpty(db);
    const events = await db.collection('events')
      .find({ published: true }, { projection: { _id: 0 } })
      .sort({ date: 1 })
      .toArray();
    return jsonResponse({ success: true, data: events });
  }

  if (route.startsWith('events/') && route.endsWith('/register') && method === 'POST') {
    const eventId = route.split('/')[1];
    const body = await req.json();
    const reg = {
      id: uuidv4(),
      eventId,
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    await db.collection('event_registrations').insertOne(reg);
    const event = await db.collection('events').findOne({ id: eventId }, { projection: { _id: 0 } });
    sendEventRegistrationEmail(reg, event).catch((e) => console.error('Event email failed:', e?.message));
    return jsonResponse({ success: true, data: reg, message: 'Registration confirmed!' }, 201);
  }

  // ---------- AUTH (admin login) ----------
  if (route === 'auth/login' && method === 'POST') {
    const { email, password } = await req.json();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: 'ADMIN', id: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return jsonResponse({ success: true, data: { token, user: { email, role: 'ADMIN' } } });
    }
    // Check users collection for non-admin users
    const user = await db.collection('users').findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const token = jwt.sign({ email, role: user.role, id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return jsonResponse({ success: true, data: { token, user: { email, role: user.role, firstName: user.firstName } } });
    }
    return jsonResponse({ success: false, error: 'Invalid credentials' }, 401);
  }

  if (route === 'auth/signup' && method === 'POST') {
    const body = await req.json();
    if (!body.email || !body.password) return jsonResponse({ success: false, error: 'Email and password required' }, 400);
    const existing = await db.collection('users').findOne({ email: body.email });
    if (existing) return jsonResponse({ success: false, error: 'User already exists' }, 400);
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = {
      id: uuidv4(),
      email: body.email,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      passwordHash,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    await db.collection('users').insertOne(user);
    sendWelcomeEmail(user).catch((e) => console.error('Welcome email failed:', e?.message));
    const token = jwt.sign({ email: user.email, role: 'USER', id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return jsonResponse({ success: true, data: { token, user: { email: user.email, role: 'USER', firstName: user.firstName } } }, 201);
  }

  // ---------- ADMIN STATS ----------
  if (route === 'admin/stats' && method === 'GET') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const [leadsCount, blogsCount, eventsCount, regsCount] = await Promise.all([
      db.collection('leads').countDocuments(),
      db.collection('blogs').countDocuments(),
      db.collection('events').countDocuments(),
      db.collection('event_registrations').countDocuments(),
    ]);
    const recentLeads = await db.collection('leads').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(5).toArray();
    return jsonResponse({
      success: true,
      data: { leadsCount, blogsCount, eventsCount, regsCount, recentLeads },
    });
  }

  // ---------- NEWSLETTER ----------
  if (route === 'newsletter' && method === 'POST') {
    const { email } = await req.json();
    if (!email) return jsonResponse({ success: false, error: 'Email required' }, 400);
    await db.collection('newsletter').updateOne(
      { email },
      { $setOnInsert: { id: uuidv4(), email, createdAt: new Date().toISOString() } },
      { upsert: true }
    );
    return jsonResponse({ success: true, message: 'Subscribed!' });
  }

  // ---------- HACKATHONS ----------
  async function seedHackathonsIfEmpty() {
    const c = await db.collection('hackathons').countDocuments();
    if (c > 0) return;
    await db.collection('hackathons').insertOne({
      id: uuidv4(),
      title: 'AlGloryThm AI Builders Hackathon 2025',
      description: 'A 48-hour intensive hackathon. Build the next generation of AI agents with mentorship from top engineers. \u20b95L prize pool, free swag, food, and the chance to join AlGloryThm.',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23).toISOString(),
      registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
      image: 'https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
      location: 'Hybrid \u2014 Online + Bangalore',
      maxTeams: 50,
      prizePool: '\u20b95,00,000',
      published: true,
      createdAt: new Date().toISOString(),
    });
  }

  if (route === 'hackathons' && method === 'GET') {
    await seedHackathonsIfEmpty();
    const hacks = await db.collection('hackathons').find({ published: true }, { projection: { _id: 0 } }).sort({ startDate: 1 }).toArray();
    return jsonResponse({ success: true, data: hacks });
  }

  if (route === 'hackathons/invite-info' && method === 'GET') {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);
    const invite = await db.collection('hackathon_invites').findOne({ token }, { projection: { _id: 0 } });
    if (!invite) return jsonResponse({ success: false, error: 'Invalid token' }, 404);
    const team = await db.collection('hackathon_teams').findOne({ id: invite.teamId }, { projection: { _id: 0 } });
    const hack = await db.collection('hackathons').findOne({ id: invite.hackathonId }, { projection: { _id: 0 } });
    return jsonResponse({ success: true, data: { invite, team, hackathon: hack } });
  }

  if (route === 'hackathons/confirm' && method === 'POST') {
    const { token, firstName, lastName, linkedIn, github, college, year, skillset, projectInterests } = await req.json();
    const invite = await db.collection('hackathon_invites').findOne({ token });
    if (!invite) return jsonResponse({ success: false, error: 'Invalid invitation token' }, 404);
    if (invite.status === 'CONFIRMED') return jsonResponse({ success: false, error: 'Already confirmed' }, 400);
    if (new Date(invite.expiresAt) < new Date()) return jsonResponse({ success: false, error: 'Invitation expired' }, 400);
    await db.collection('hackathon_participants').insertOne({
      id: uuidv4(),
      hackathonId: invite.hackathonId,
      teamId: invite.teamId,
      email: invite.email,
      firstName, lastName, linkedIn, github, college, year, skillset, projectInterests,
      isLeader: false,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    await db.collection('hackathon_invites').updateOne({ token }, { $set: { status: 'CONFIRMED', confirmedAt: new Date().toISOString() } });
    const team = await db.collection('hackathon_teams').findOne({ id: invite.teamId }, { projection: { _id: 0 } });
    return jsonResponse({ success: true, data: { team, message: 'Welcome to the team!' } });
  }

  if (route.startsWith('hackathons/') && route.endsWith('/teams') && method === 'POST') {
    const hackathonId = route.split('/')[1];
    const body = await req.json();
    const hack = await db.collection('hackathons').findOne({ id: hackathonId });
    if (!hack) return jsonResponse({ success: false, error: 'Hackathon not found' }, 404);
    const existing = await db.collection('hackathon_teams').findOne({ hackathonId, teamName: body.teamName });
    if (existing) return jsonResponse({ success: false, error: 'Team name already taken' }, 400);
    const teamId = uuidv4();
    const leaderId = uuidv4();
    const team = {
      id: teamId,
      hackathonId,
      teamName: body.teamName,
      teamLeaderId: leaderId,
      projectName: body.projectName || '',
      projectDescription: body.projectDescription || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    await db.collection('hackathon_teams').insertOne(team);
    const leader = body.leader || {};
    await db.collection('hackathon_participants').insertOne({
      id: leaderId,
      hackathonId,
      teamId,
      email: leader.email,
      firstName: leader.firstName,
      lastName: leader.lastName,
      linkedIn: leader.linkedIn,
      github: leader.github,
      college: leader.college,
      year: leader.year,
      skillset: leader.skillset,
      projectInterests: leader.projectInterests,
      isLeader: true,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    const memberEmails = (body.memberEmails || []).filter((e) => e && e.includes('@'));
    let invitesSent = 0;
    for (const email of memberEmails) {
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString();
      await db.collection('hackathon_invites').insertOne({
        id: uuidv4(),
        hackathonId,
        teamId,
        email,
        token,
        expiresAt,
        status: 'INVITED',
        invitedBy: `${leader.firstName} ${leader.lastName || ''}`.trim(),
        createdAt: new Date().toISOString(),
      });
      invitesSent++;
      sendHackathonInviteEmail({
        email,
        teamName: body.teamName,
        organizerName: `${leader.firstName} ${leader.lastName || ''}`.trim(),
        token,
        hackathonTitle: hack.title,
      }).catch((e) => console.error('Invite email failed:', e?.message));
    }
    return jsonResponse({ success: true, data: { team, invitesSent } }, 201);
  }

  if (route.startsWith('hackathons/') && method === 'GET' && route.split('/').length === 2) {
    const id = route.split('/')[1];
    const hack = await db.collection('hackathons').findOne({ id }, { projection: { _id: 0 } });
    if (!hack) return jsonResponse({ success: false, error: 'Hackathon not found' }, 404);
    const teams = await db.collection('hackathon_teams').find({ hackathonId: id }, { projection: { _id: 0 } }).toArray();
    return jsonResponse({ success: true, data: { ...hack, teamsCount: teams.length } });
  }

  // ---------- BLOG ADMIN (CRUD) ----------
  if (route === 'admin/blogs' && method === 'GET') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const blogs = await db.collection('blogs').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    return jsonResponse({ success: true, data: blogs });
  }

  if (route.startsWith('admin/blogs/') && method === 'GET') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const id = route.split('/')[2];
    const blog = await db.collection('blogs').findOne({ id }, { projection: { _id: 0 } });
    if (!blog) return jsonResponse({ success: false, error: 'Not found' }, 404);
    return jsonResponse({ success: true, data: blog });
  }

  if (route.startsWith('admin/blogs/') && method === 'PATCH') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const id = route.split('/')[2];
    const body = await req.json();
    await db.collection('blogs').updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
    const blog = await db.collection('blogs').findOne({ id }, { projection: { _id: 0 } });
    return jsonResponse({ success: true, data: blog });
  }

  if (route.startsWith('admin/blogs/') && method === 'DELETE') {
    if (!requireAdmin(req)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const id = route.split('/')[2];
    await db.collection('blogs').deleteOne({ id });
    return jsonResponse({ success: true });
  }

  return jsonResponse({ success: false, error: `Route not found: ${method} /${route}` }, 404);
}

export async function GET(req, { params }) { return handleRequest(req, params); }
export async function POST(req, { params }) { return handleRequest(req, params); }
export async function PATCH(req, { params }) { return handleRequest(req, params); }
export async function DELETE(req, { params }) { return handleRequest(req, params); }
export async function PUT(req, { params }) { return handleRequest(req, params); }
