import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ShieldCheck, ShieldAlert, ShieldQuestion, FileText, Database, Cpu } from 'lucide-react'

const verdictConfig = {
  verified: {
    icon: ShieldCheck,
    label: 'Verified',
    color: 'text-verified',
    bg: 'bg-verified/8',
    border: 'border-verified/20',
    dot: 'bg-verified',
    barColor: 'bg-verified',
  },
  true: {
    icon: ShieldCheck,
    label: 'True',
    color: 'text-verified',
    bg: 'bg-verified/8',
    border: 'border-verified/20',
    dot: 'bg-verified',
    barColor: 'bg-verified',
  },
  false: {
    icon: ShieldAlert,
    label: 'False',
    color: 'text-verdict-false',
    bg: 'bg-verdict-false/8',
    border: 'border-verdict-false/20',
    dot: 'bg-verdict-false',
    barColor: 'bg-verdict-false',
  },
  uncertain: {
    icon: ShieldQuestion,
    label: 'Uncertain',
    color: 'text-unverifiable',
    bg: 'bg-unverifiable/8',
    border: 'border-unverifiable/20',
    dot: 'bg-unverifiable',
    barColor: 'bg-unverifiable',
  },
  unverifiable: {
    icon: ShieldQuestion,
    label: 'Unverifiable',
    color: 'text-unverifiable',
    bg: 'bg-unverifiable/8',
    border: 'border-unverifiable/20',
    dot: 'bg-unverifiable',
    barColor: 'bg-unverifiable',
  },
}

export default function ClaimCard({ claim, verdict, confidence, reason, evidence, source, index }) {
  const [expanded, setExpanded] = useState(false)
  const config = verdictConfig[verdict] || verdictConfig.unverifiable
  const Icon = config.icon
  const normalizedSource = source === 'knowledge_base' ? 'pinecone' : source

  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden card-hover transition-smooth`}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-start gap-4 text-left hover:bg-white/3 transition-smooth"
      >
        {/* Verdict icon */}
        <div className={`mt-0.5 w-10 h-10 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-500 text-text-primary leading-relaxed">{claim}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={`text-xs font-700 uppercase tracking-wider ${config.color}`}>
              {config.label}
            </span>
            {/* Confidence bar */}
            <div className="flex items-center gap-2 flex-1 max-w-40">
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${config.barColor} transition-all duration-500`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-xs font-600 text-text-tertiary tabular-nums">{confidence}%</span>
            </div>
            {/* Source badge */}
            {normalizedSource && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-600 uppercase tracking-wider ${
                normalizedSource === 'llm'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : normalizedSource === 'pinecone'
                  ? 'bg-accent/10 text-accent border border-accent/25'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {normalizedSource === 'llm'
                  ? <Cpu className="w-3 h-3" />
                  : normalizedSource === 'pinecone'
                  ? <Database className="w-3 h-3" />
                  : <Database className="w-3 h-3" />}
                {normalizedSource === 'llm' ? 'LLM' : normalizedSource === 'pinecone' ? 'Pinecone' : 'Knowledge Base'}
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <ChevronDown
          className={`w-5 h-5 text-text-tertiary shrink-0 mt-0.5 transition-smooth ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 ml-14 border-t border-white/5">
              {/* Reason */}
              {reason && (
                <div className="mb-5">
                  <p className="text-xs font-700 text-text-tertiary uppercase tracking-wider mb-2">Reasoning</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{reason}</p>
                </div>
              )}

              {/* Evidence */}
              {evidence && evidence.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-text-tertiary uppercase tracking-wider mb-3">Evidence Sources</p>
                  <div className="space-y-2.5">
                    {evidence.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-lg bg-white/3 border border-white/5 transition-smooth hover:bg-white/5"
                      >
                        <FileText className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-secondary leading-relaxed">{e.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-text-tertiary">Source: {e.source}</span>
                            <span className="text-xs text-text-tertiary">Relevance: {e.score}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  )
}
