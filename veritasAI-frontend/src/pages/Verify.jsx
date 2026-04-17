import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Send, AlertCircle, ShieldCheck, ShieldAlert, ShieldQuestion, RotateCcw } from 'lucide-react'
import { verifyResponse } from '../api/client'
import ClaimCard from '../components/ClaimCard'
import Loader from '../components/Loader'

export default function Verify() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const data = await verifyResponse(trimmed)
      setResults(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setInput('')
    setResults(null)
    setError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleVerify()
    }
  }

  // Count verdicts
  const verdictCounts = results?.claims?.reduce(
    (acc, c) => {
      acc[c.verdict] = (acc[c.verdict] || 0) + 1
      return acc
    },
    {},
  )

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-700 tracking-tight mb-4 text-text-primary">
            Verify <span className="gradient-text">Claims</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
            Paste any AI-generated text below. VeritasAI will extract factual claims and verify each one against our knowledge base.
          </p>
        </Motion.div>

        {/* Input section */}
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-6 mb-8 border border-border"
        >
          <textarea
            id="verify-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste an LLM response here... (e.g. 'The speed of light is 300,000 km/s. Python was created in 1989.')"
            rows={7}
            maxLength={10000}
            disabled={loading}
            className="input-focus w-full bg-transparent text-text-primary placeholder:text-text-tertiary text-base leading-relaxed resize-none focus:outline-none focus:border-accent focus:ring-0 disabled:opacity-50 transition-smooth font-400"
          />

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
            <span className="text-xs font-500 text-text-tertiary">
              {input.length.toLocaleString()} / 10,000 characters
              <span className="hidden sm:inline text-text-tertiary/60"> · Ctrl+Enter to submit</span>
            </span>

            <div className="flex items-center gap-2.5">
              {(results || error) && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-smooth text-sm font-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
              <button
                id="verify-submit"
                onClick={handleVerify}
                disabled={!input.trim() || loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg btn-primary text-sm font-600 disabled:opacity-40 disabled:cursor-not-allowed transition-smooth"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>
        </Motion.div>

        {/* Loading state */}
        {loading && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <Loader size="lg" text="Extracting and verifying claims..." />
          </Motion.div>
        )}

        {/* Error state */}
        {error && (
          <Motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-verdict-false/25 bg-verdict-false/8 px-6 py-4 flex items-start gap-4"
          >
            <AlertCircle className="w-5 h-5 text-verdict-false shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-600 text-verdict-false">Verification Failed</p>
              <p className="text-sm text-text-secondary mt-1.5">{error}</p>
            </div>
          </Motion.div>
        )}

        {/* Results */}
        {results && !loading && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Summary bar */}
            <div className="glass-panel rounded-xl px-6 py-5 mb-8 flex flex-wrap items-center gap-6 border border-border">
              <span className="text-sm font-500 text-text-secondary">
                <span className="text-text-primary font-700">{results.claims?.length || 0}</span> claims found
              </span>

              {(verdictCounts?.verified > 0 || verdictCounts?.true > 0) && (
                <span className="flex items-center gap-2 text-sm font-500 text-verified">
                  <ShieldCheck className="w-4 h-4" />
                  {(verdictCounts.verified || 0) + (verdictCounts.true || 0)} verified
                </span>
              )}
              {verdictCounts?.false > 0 && (
                <span className="flex items-center gap-2 text-sm font-500 text-verdict-false">
                  <ShieldAlert className="w-4 h-4" />
                  {verdictCounts.false} false
                </span>
              )}
              {(verdictCounts?.unverifiable > 0 || verdictCounts?.uncertain > 0) && (
                <span className="flex items-center gap-2 text-sm font-500 text-unverifiable">
                  <ShieldQuestion className="w-4 h-4" />
                  {(verdictCounts.unverifiable || 0) + (verdictCounts.uncertain || 0)} unverifiable
                </span>
              )}

              {results.auditId && (
                <span className="ml-auto text-xs font-500 text-text-tertiary font-mono">
                  ID: {results.auditId.slice(-8)}
                </span>
              )}
            </div>

            {/* Claim cards */}
            {results.claims?.length > 0 ? (
              <div className="space-y-4">
                {results.claims.map((c, i) => (
                  <ClaimCard key={i} index={i} {...c} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-text-secondary text-base">No factual claims were found in the provided text.</p>
              </div>
            )}
          </Motion.div>
        )}
      </div>
    </div>
  )
}
