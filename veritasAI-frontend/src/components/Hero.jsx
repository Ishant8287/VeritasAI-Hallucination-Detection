import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Database } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[140px]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-base via-base/50 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-border bg-surface-glass text-xs font-500 text-text-secondary mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              Real-time AI Fact Verification
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-700 leading-[1.05] tracking-tight mb-8 text-text-primary"
            >
              Stop trusting.{' '}
              <br />
              <span className="gradient-text">Start verifying.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-text-secondary leading-relaxed max-w-xl mb-12 font-400"
            >
              VeritasAI is a real-time hallucination detection middleware that intercepts LLM responses, extracts factual claims, and scores each one against a verified knowledge base.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="/verify"
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-lg btn-primary font-600 text-base"
              >
                Verify Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-smooth text-base font-500"
              >
                How It Works
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-12 mt-16"
            >
              {[
                { value: '3', label: 'AI Models' },
                { value: '<2s', label: 'Avg Latency' },
                { value: '97%', label: 'Accuracy' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-700 gradient-text">{s.value}</div>
                  <div className="text-sm text-text-tertiary mt-2 font-500">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — live preview mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="glass-panel rounded-2xl p-8 glow-accent card-hover">
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-verdict-false/70" />
                <div className="w-3 h-3 rounded-full bg-unverifiable/70" />
                <div className="w-3 h-3 rounded-full bg-verified/70" />
                <span className="ml-3 text-xs text-text-tertiary font-500">veritas-engine</span>
              </div>

              {/* Mockup claim results */}
              <div className="space-y-3">
                <ClaimPreview
                  claim="The speed of light is 299,792 km/s"
                  verdict="verified"
                  confidence={96}
                />
                <ClaimPreview
                  claim="Python was created in 1989"
                  verdict="false"
                  confidence={88}
                />
                <ClaimPreview
                  claim="GPT-5 was released in 2024"
                  verdict="unverifiable"
                  confidence={30}
                />
              </div>

              {/* Decorative footer */}
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-verified" /> 1 verified</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-verdict-false" /> 1 false</span>
                  <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-unverifiable" /> 1 unclear</span>
                </div>
                <span className="text-xs text-text-tertiary font-500">1.2s</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ClaimPreview({ claim, verdict, confidence }) {
  const colors = {
    verified: { bg: 'bg-verified/8', border: 'border-verified/20', text: 'text-verified', dot: 'bg-verified' },
    false: { bg: 'bg-verdict-false/8', border: 'border-verdict-false/20', text: 'text-verdict-false', dot: 'bg-verdict-false' },
    unverifiable: { bg: 'bg-unverifiable/8', border: 'border-unverifiable/20', text: 'text-unverifiable', dot: 'bg-unverifiable' },
  }
  const c = colors[verdict]

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl px-4 py-3 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
        <span className="text-sm text-text-primary truncate">{claim}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-medium ${c.text} uppercase`}>{verdict}</span>
        <span className="text-xs text-text-tertiary">{confidence}%</span>
      </div>
    </div>
  )
}
