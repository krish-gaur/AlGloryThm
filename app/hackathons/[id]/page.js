'use client';

// ─── React & Next.js ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import Link          from 'next/link';
import Image         from 'next/image';
import { useParams } from 'next/navigation';

// ─── Third-party ──────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight,
  Calendar, MapPin,
  Trophy, Users,
  X, Plus,
  CheckCircle2, Mail,
  Loader2, Upload, FileText,
} from 'lucide-react';

// ─── Local ────────────────────────────────────────────────────────────────────
import { uploadToCloudinary } from '@/lib/clientUpload';


// ─── Constants ────────────────────────────────────────────────────────────────
const INPUT_CLASS =
  'w-full glass rounded-lg px-4 py-2.5 text-sm text-white ' +
  'placeholder:text-white/40 focus:outline-none ' +
  'focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/40';

const LEADER_DEFAULTS = {
  firstName:        '',
  lastName:         '',
  email:            '',
  linkedIn:         '',
  github:           '',
  college:          '',
  year:             '',
  skillset:         '',
  projectInterests: '',
  resumeUrl:        '',
};

const FORM_DEFAULTS = {
  teamName:           '',
  projectName:        '',
  projectDescription: '',
  leader:             LEADER_DEFAULTS,
  memberEmails:       [''],
};


// ─── Component ────────────────────────────────────────────────────────────────
export default function HackathonDetail() {
  const params = useParams();
  const id     = params?.id;

  // ── State ─────────────────────────────────────────────────────────────────
  const [hack,            setHack]            = useState(null);
  const [showForm,        setShowForm]        = useState(false);
  const [success,         setSuccess]         = useState(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState('');
  const [form,            setForm]            = useState(FORM_DEFAULTS);
  const [uploadingResume, setUploadingResume] = useState(false);


  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`/api/hackathons/${id}`)
      .then((r) => r.json())
      .then((d) => setHack(d.data));
  }, [id]);


  // ── Handlers ──────────────────────────────────────────────────────────────
  const updateLeader = (k, v) =>
    setForm({ ...form, leader: { ...form.leader, [k]: v } });

  const updateMember = (i, v) => {
    const ne = [...form.memberEmails];
    ne[i]    = v;
    setForm({ ...form, memberEmails: ne });
  };

  const addMember = () =>
    setForm({ ...form, memberEmails: [...form.memberEmails, ''] });

  const removeMember = (i) =>
    setForm({ ...form, memberEmails: form.memberEmails.filter((_, idx) => idx !== i) });

  const uploadResume = async (file) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const res = await uploadToCloudinary(file, 'resume');
      updateLeader('resumeUrl', res.secure_url);
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/hackathons/${id}/teams`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          memberEmails: form.memberEmails.filter((m) => m && m.includes('@')),
        }),
      });

      const json = await res.json();

      if (json.success) setSuccess(json.data);
      else              setError(json.error || 'Failed to register');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };


  // ── Guards ────────────────────────────────────────────────────────────────
  if (!hack) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white/50">
        Loading...
      </main>
    );
  }


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen relative noise">

      {/* Background */}
      <div
        className="aurora w-[700px] h-[700px] -top-60 left-1/2 -translate-x-1/2 bg-[#0066FF]"
        style={{ opacity: 0.2 }}
      />
      <div className="absolute inset-0 bg-grid opacity-30" />


      <div className="relative container mx-auto px-6 py-16 max-w-5xl">

        {/* Back navigation */}
        <Link
          href="/hackathons"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#00D4FF] mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          All hackathons
        </Link>


        {/* ── Success state ──────────────────────────────────────────────── */}
        {success ? (
          <div className="glass-strong rounded-2xl p-12 text-center">

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center mx-auto mb-6 glow-blue-strong">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-3">Team registered!</h2>

            <p className="text-white/60 mb-6">
              Team{' '}
              <strong className="text-[#00D4FF]">{success.team.teamName}</strong>
              {' '}is in. We sent{' '}
              <strong>{success.invitesSent}</strong>
              {' '}invitation email(s) to your members.
            </p>

            <p className="text-sm text-white/50 mb-8">
              Once they confirm via email, your team will be complete.
            </p>

            <Link
              href="/hackathons"
              className="btn-primary px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              View all hackathons
            </Link>

          </div>


        ) : (
          <>

            {/* ── Hackathon hero card ───────────────────────────────────── */}
            <div className="glass-strong rounded-2xl overflow-hidden mb-12">

              {/* Hero image */}
              <div className="aspect-[21/9] relative">
                <Image
                  src={hack.image}
                  alt={hack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-[#03050B]/40 to-transparent" />

                <div className="absolute bottom-0 inset-x-0 p-8">
                  <div className="inline-flex glass-strong px-3 py-1 rounded-full text-xs text-[#00D4FF] mb-3">
                    <Trophy className="w-3 h-3 mr-1" />
                    Prize pool: {hack.prizePool}
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-bold mb-2">{hack.title}</h1>
                </div>
              </div>

              {/* Stats & CTA */}
              <div className="p-8">
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  {hack.description}
                </p>

                <div className="grid sm:grid-cols-4 gap-4 mb-6">
                  <div className="glass rounded-lg p-4">
                    <Calendar className="w-4 h-4 text-[#00D4FF] mb-2" />
                    <div className="text-xs text-white/50">Starts</div>
                    <div className="text-sm font-semibold">
                      {new Date(hack.startDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="glass rounded-lg p-4">
                    <MapPin className="w-4 h-4 text-[#00D4FF] mb-2" />
                    <div className="text-xs text-white/50">Location</div>
                    <div className="text-sm font-semibold">{hack.location}</div>
                  </div>

                  <div className="glass rounded-lg p-4">
                    <Users className="w-4 h-4 text-[#00D4FF] mb-2" />
                    <div className="text-xs text-white/50">Capacity</div>
                    <div className="text-sm font-semibold">{hack.maxTeams} teams</div>
                  </div>

                  <div className="glass rounded-lg p-4">
                    <Trophy className="w-4 h-4 text-[#00D4FF] mb-2" />
                    <div className="text-xs text-white/50">Registered</div>
                    <div className="text-sm font-semibold">{hack.teamsCount || 0} teams</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary px-8 py-3 rounded-lg inline-flex items-center gap-2 font-semibold"
                >
                  Register your team <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>


            {/* ── Registration form ─────────────────────────────────────── */}
            {showForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={submit}
                className="glass-strong rounded-2xl p-8 lg:p-10 space-y-8"
              >

                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">Team registration</h2>
                  <p className="text-white/60 text-sm">
                    Fill in team details. Team members will receive an email invitation to confirm participation.
                  </p>
                </div>


                {/* ── Section: Team info ─────────────────────────────────── */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#00D4FF] mb-4">
                    Team info
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Team name *</label>
                      <input
                        required
                        value={form.teamName}
                        onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                        className={INPUT_CLASS}
                        placeholder="e.g. Neural Knights"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Project name (idea)</label>
                      <input
                        value={form.projectName}
                        onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                        className={INPUT_CLASS}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-white/50 mb-1.5 block">Project description</label>
                    <textarea
                      rows={3}
                      value={form.projectDescription}
                      onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                      className={`${INPUT_CLASS} resize-none`}
                      placeholder="Brief idea of what you want to build (optional)"
                    />
                  </div>
                </div>


                {/* ── Section: Team leader ───────────────────────────────── */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#00D4FF] mb-4">
                    Team leader (you)
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="First name *"
                      value={form.leader.firstName}
                      onChange={(e) => updateLeader('firstName', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      placeholder="Last name"
                      value={form.leader.lastName}
                      onChange={(e) => updateLeader('lastName', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email *"
                      value={form.leader.email}
                      onChange={(e) => updateLeader('email', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      placeholder="College"
                      value={form.leader.college}
                      onChange={(e) => updateLeader('college', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      placeholder="Year (e.g. 3rd year)"
                      value={form.leader.year}
                      onChange={(e) => updateLeader('year', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      placeholder="LinkedIn URL"
                      value={form.leader.linkedIn}
                      onChange={(e) => updateLeader('linkedIn', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      placeholder="GitHub URL"
                      value={form.leader.github}
                      onChange={(e) => updateLeader('github', e.target.value)}
                      className={INPUT_CLASS}
                    />
                    <input
                      placeholder="Skills (e.g. React, Python, ML)"
                      value={form.leader.skillset}
                      onChange={(e) => updateLeader('skillset', e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div className="mt-4">
                    <textarea
                      rows={2}
                      placeholder="What are you most interested in building?"
                      value={form.leader.projectInterests}
                      onChange={(e) => updateLeader('projectInterests', e.target.value)}
                      className={`${INPUT_CLASS} resize-none`}
                    />
                  </div>

                  {/* Resume upload */}
                  <div className="mt-4">
                    <label className="text-xs text-white/50 mb-2 block">
                      Resume (optional, PDF/image)
                    </label>

                    {form.leader.resumeUrl ? (
                      <div className="flex items-center gap-3 glass rounded-lg p-3">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <a
                          href={form.leader.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#00D4FF] flex-1 truncate"
                        >
                          Resume uploaded ✓
                        </a>
                        <button
                          type="button"
                          onClick={() => updateLeader('resumeUrl', '')}
                          className="text-xs text-white/50 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 glass rounded-lg p-3 cursor-pointer hover:bg-white/5">
                        {uploadingResume
                          ? <Loader2 className="w-4 h-4 animate-spin text-[#00D4FF]" />
                          : <Upload  className="w-4 h-4 text-[#00D4FF]" />
                        }
                        <span className="text-sm text-white/70">
                          {uploadingResume ? 'Uploading...' : 'Upload resume'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          disabled={uploadingResume}
                          onChange={(e) => uploadResume(e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>


                {/* ── Section: Team members ──────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#00D4FF]">
                        Team members
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        Add up to 5 emails. We&apos;ll send each an invitation link.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addMember}
                      disabled={form.memberEmails.length >= 5}
                      className="btn-ghost px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.memberEmails.map((m, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="email"
                            value={m}
                            onChange={(e) => updateMember(i, e.target.value)}
                            placeholder={`member${i + 1}@example.com`}
                            className={`${INPUT_CLASS} pl-10`}
                          />
                        </div>

                        {form.memberEmails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            className="glass rounded-lg p-2.5 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>


                {/* ── Submit ─────────────────────────────────────────────── */}
                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <>Register team & send invites <ArrowRight className="w-4 h-4" /></>
                  }
                </button>

              </motion.form>
            )}

          </>
        )}

      </div>
    </main>
  );
}