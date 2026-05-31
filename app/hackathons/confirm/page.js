'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Trophy,
  User,
  GraduationCap,
  Linkedin,
  Github,
  Zap,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Calendar,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  firstName:        '',
  lastName:         '',
  linkedIn:         '',
  github:           '',
  college:          '',
  year:             '',
  skillset:         '',
  projectInterests: '',
};

// Steps define the multi-step form flow
const STEPS = [
  {
    id:     'identity',
    label:  'You',
    title:  'Who are you?',
    fields: ['firstName', 'lastName'],
  },
  {
    id:     'education',
    label:  'Education',
    title:  'Where do you study?',
    fields: ['college', 'year'],
  },
  {
    id:     'links',
    label:  'Links',
    title:  'Your profiles',
    fields: ['linkedIn', 'github'],
  },
  {
    id:     'skills',
    label:  'Skills',
    title:  'What do you bring?',
    fields: ['skillset', 'projectInterests'],
  },
];

// ─── Shared animation variants ────────────────────────────────────────────────

const fadeSlide = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldIcon({ fieldKey }) {
  const map = {
    firstName:        User,
    lastName:         User,
    college:          GraduationCap,
    year:             Calendar,
    linkedIn:         Linkedin,
    github:           Github,
    skillset:         Zap,
    projectInterests: MessageSquare,
  };
  const Icon = map[fieldKey] ?? User;
  return <Icon className="w-4 h-4 text-white/30 flex-shrink-0" />;
}

function fieldMeta(key) {
  const meta = {
    firstName:        { placeholder: 'First name',                     required: true,  type: 'text',     rows: null },
    lastName:         { placeholder: 'Last name',                      required: false, type: 'text',     rows: null },
    college:          { placeholder: 'College / University',           required: false, type: 'text',     rows: null },
    year:             { placeholder: 'Year (e.g. 2nd year, Graduate)', required: false, type: 'text',     rows: null },
    linkedIn:         { placeholder: 'linkedin.com/in/yourname',       required: false, type: 'url',      rows: null },
    github:           { placeholder: 'github.com/yourhandle',          required: false, type: 'url',      rows: null },
    skillset:         { placeholder: 'React, Python, ML, UI design…',  required: false, type: 'text',     rows: null },
    projectInterests: { placeholder: 'What excites you about this hackathon?', required: false, type: 'textarea', rows: 3  },
  };
  return meta[key] ?? { placeholder: key, required: false, type: 'text', rows: null };
}

// ─── Loading State ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div {...fadeSlide} className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
        </div>
        <p className="text-white/40 text-sm">Verifying your invitation…</p>
      </motion.div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        {...fadeSlide}
        className="glass-strong rounded-2xl p-10 max-w-sm w-full text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold mb-2">Invitation issue</h1>
        <p className="text-red-400/80 text-sm mb-7 leading-relaxed">{message}</p>
        <Link
          href="/hackathons"
          className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm font-semibold"
        >
          Browse hackathons
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessScreen({ teamName, hackathonTitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass-strong rounded-3xl p-12 max-w-md w-full text-center"
      >
        {/* Animated checkmark ring */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-[#00D4FF]/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#0066FF]/20
                          border border-[#00D4FF]/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#00D4FF]" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                        bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF]
                        text-xs font-semibold tracking-wider uppercase mb-4">
          <Trophy className="w-3 h-3" />
          You&apos;re in
        </div>

        <h1 className="text-3xl font-bold mb-3">Welcome aboard!</h1>

        <p className="text-white/55 leading-relaxed mb-2">
          You&apos;ve joined{' '}
          <span className="text-white font-semibold">{teamName}</span>{' '}
          for
        </p>
        <p className="text-[#00D4FF] font-semibold mb-8">{hackathonTitle}</p>

        <div className="glass rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
          <Mail className="w-4 h-4 text-[#00D4FF] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-white/60 leading-relaxed">
            Your team leader will reach out shortly with the Slack link and next steps.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn-primary w-full py-3.5 rounded-xl inline-flex items-center
                     justify-center gap-2 font-semibold group"
        >
          Go to dashboard
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent  = i === currentStep;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${isComplete
                    ? 'bg-[#00D4FF] text-[#03050B]'
                    : isCurrent
                      ? 'bg-[#00D4FF]/20 text-[#00D4FF] ring-1 ring-[#00D4FF]/50'
                      : 'bg-white/5 text-white/30'
                  }`}
              >
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap hidden sm:block
                  ${isCurrent ? 'text-[#00D4FF]' : isComplete ? 'text-white/60' : 'text-white/25'}`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line (not after last) */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5 sm:mb-4 relative overflow-hidden bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#00D4FF]"
                  initial={{ width: '0%' }}
                  animate={{ width: isComplete ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Single field renderer ────────────────────────────────────────────────────

function FormField({ fieldKey, value, onChange }) {
  const { placeholder, required, type, rows } = fieldMeta(fieldKey);

  const baseClass =
    'w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white ' +
    'placeholder:text-white/30 focus:outline-none focus:border-[#00D4FF]/50 focus:bg-white/8 ' +
    'transition-all duration-200';

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-3.5 z-10">
        <FieldIcon fieldKey={fieldKey} />
      </div>
      {type === 'textarea' ? (
        <textarea
          rows={rows}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${baseClass} pt-3 pb-3 resize-none`}
        />
      ) : (
        <input
          type={type}
          required={required}
          placeholder={`${placeholder}${required ? ' *' : ''}`}
          value={value}
          onChange={onChange}
          className={`${baseClass} py-3`}
        />
      )}
    </div>
  );
}

// ─── Invitation context header ────────────────────────────────────────────────

function InviteHeader({ info }) {
  return (
    <div className="glass rounded-2xl p-5 mb-7 flex items-start gap-4">
      {/* Trophy badge */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#0066FF]/20
                      border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
        <Trophy className="w-5 h-5 text-[#00D4FF]" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-[#00D4FF] font-semibold tracking-widest uppercase mb-0.5">
          Hackathon Invitation
        </div>
        <h2 className="text-base font-bold truncate">{info?.hackathon?.title}</h2>
        <p className="text-sm text-white/50 mt-0.5">
          <span className="text-white/70 font-medium">{info?.invite?.invitedBy}</span>
          {' '}invited you to join{' '}
          <span className="text-white/70 font-medium">{info?.team?.teamName}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Main multi-step form ─────────────────────────────────────────────────────

function ConfirmInner() {
  const sp    = useSearchParams();
  const token = sp.get('token');

  const [info,        setInfo]        = useState(null);
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [step,        setStep]        = useState(0);
  const [direction,   setDirection]   = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [success,     setSuccess]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  // ── Fetch invite info
  useEffect(() => {
    if (!token) {
      setError('Missing invitation token');
      setLoading(false);
      return;
    }
    fetch(`/api/hackathons/invite-info?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setInfo(d.data);
        else           setError(d.error || 'Invalid or expired invitation');
      })
      .catch(() => setError('Network error — please try again'))
      .finally(() => setLoading(false));
  }, [token]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isLastStep = step === STEPS.length - 1;

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  // Validate required fields for the current step
  const canAdvance = () => {
    const current = STEPS[step];
    return current.fields.every((f) => {
      const { required } = fieldMeta(f);
      return !required || form[f].trim().length > 0;
    });
  };

  // ── Final submission
  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res  = await fetch('/api/hackathons/confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, ...form }),
      });
      const json = await res.json();
      if (json.success) setSuccess(true);
      else              setError(json.error || 'Confirmation failed — please try again');
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Conditional renders
  if (loading)        return <LoadingScreen />;
  if (error && !info) return <ErrorScreen message={error} />;
  if (success)        return <SuccessScreen teamName={info?.team?.teamName} hackathonTitle={info?.hackathon?.title} />;

  const currentStep = STEPS[step];

  const slideVariants = {
    enter:   { opacity: 0, x: direction * 24 },
    center:  { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: direction * -24 },
  };

  return (
    <main className="min-h-screen relative noise py-12 px-6 flex items-center justify-center">

      {/* Ambient bg */}
      <div className="aurora w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 bg-[#0066FF]" style={{ opacity: 0.18 }} />
      <div className="aurora w-[400px] h-[400px] bottom-0 right-0 bg-[#00D4FF]" style={{ opacity: 0.1 }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-xl"
      >
        <div className="glass-strong rounded-3xl p-8 lg:p-10">

          {/* Invite context */}
          <InviteHeader info={info} />

          {/* Step progress */}
          <StepProgress steps={STEPS} currentStep={step} />

          {/* Animated step fields */}
          <div className="relative overflow-hidden" style={{ minHeight: '220px' }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Step heading */}
                <div className="mb-5">
                  <div className="text-[10px] text-[#00D4FF]/60 font-semibold tracking-widest uppercase mb-1">
                    Step {step + 1} of {STEPS.length}
                  </div>
                  <h3 className="text-xl font-bold">{currentStep.title}</h3>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  {currentStep.fields.map((key) => (
                    <FormField
                      key={key}
                      fieldKey={key}
                      value={form[key]}
                      onChange={setField(key)}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Inline error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-start gap-2 text-red-400 text-sm bg-red-400/5
                           border border-red-400/20 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-7">
            {step > 0 && (
              <button
                onClick={goPrev}
                className="px-5 py-3 rounded-xl text-sm font-medium text-white/50
                           hover:text-white hover:bg-white/5 border border-white/10
                           transition-all duration-200 flex-shrink-0"
              >
                Back
              </button>
            )}

            <button
              onClick={isLastStep ? submit : goNext}
              disabled={submitting || !canAdvance()}
              className="btn-primary flex-1 py-3 rounded-xl font-semibold text-sm
                         inline-flex items-center justify-center gap-2 group
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLastStep ? (
                <>
                  Accept invitation
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Skip hint for optional steps */}
          {!isLastStep && !STEPS[step].fields.some((f) => fieldMeta(f).required) && (
            <p className="text-center text-xs text-white/25 mt-4">
              All fields on this step are optional — you can skip
            </p>
          )}

        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/25 mt-5">
          By accepting you agree to AlGloryThm's{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-white/50 transition-colors">
            participation terms
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={<LoadingScreen />}
    >
      <ConfirmInner />
    </Suspense>
  );
}