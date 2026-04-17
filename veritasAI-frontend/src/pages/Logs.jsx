import { useState, useEffect, useCallback } from 'react'
import { motion as Motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, ShieldQuestion, RefreshCw, Cpu, Database } from 'lucide-react'
import { fetchLogs } from '../api/client'
import Loader from '../components/Loader'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const loadLogs = useCallback(async (p) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchLogs(p, 10)
      setLogs(res.data || [])
      setTotalPages(res.totalPages || 1)
      setTotal(res.total || 0)
      setPage(res.page || p)
    } catch (err) {
      setError(err.message || 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs(1)
  }, [loadLogs])

  const verdictIcon = (v) => {
    const map = {
      verified: <ShieldCheck className="w-3.5 h-3.5 text-verified" />,
      true: <ShieldCheck className="w-3.5 h-3.5 text-verified" />,
      false: <ShieldAlert className="w-3.5 h-3.5 text-verdict-false" />,
      unverifiable: <ShieldQuestion className="w-3.5 h-3.5 text-unverifiable" />,
      uncertain: <ShieldQuestion className="w-3.5 h-3.5 text-unverifiable" />,
    }
    return map[v] || map.unverifiable
  }

  const verdictColor = (v) => {
    const map = {
      verified: 'text-verified',
      true: 'text-verified',
      false: 'text-verdict-false',
      unverifiable: 'text-unverifiable',
      uncertain: 'text-unverifiable',
    }
    return map[v] || map.unverifiable
  }

  const normalizeSource = (source) => (source === 'llm' ? 'llm' : 'pinecone')

  const sourceBadge = (source) => {
    const normalizedSource = normalizeSource(source)
    const isLlm = normalizedSource === 'llm'

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
        isLlm
          ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
          : 'border-accent/25 bg-accent/10 text-accent'
      }`}>
        {isLlm ? <Cpu className="w-3 h-3" /> : <Database className="w-3 h-3" />}
        {isLlm ? 'LLM' : 'Pinecone'}
      </span>
    )
  }

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-700 tracking-tight mb-4 text-text-primary">
              Audit <span className="gradient-text">Logs</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Every verification is recorded. Browse past results and evidence.
            </p>
          </div>

          <button
            onClick={() => loadLogs(page)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-smooth text-sm font-500 disabled:opacity-40 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </Motion.div>

        {/* Loading */}
        {loading && (
          <div className="py-24">
            <Loader size="lg" text="Loading audit logs..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-verdict-false/25 bg-verdict-false/8 px-6 py-5 text-center">
            <p className="text-base font-500 text-verdict-false mb-3">{error}</p>
            <button
              onClick={() => loadLogs(page)}
              className="text-base font-600 text-accent hover:text-accent-hover transition-smooth"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-24">
            <Clock className="w-14 h-14 text-text-tertiary mx-auto mb-5" />
            <p className="text-lg text-text-secondary font-500 mb-3">No audit logs yet</p>
            <p className="text-base text-text-tertiary">Verification results will appear here once you start verifying.</p>
          </div>
        )}

        {/* Logs list */}
        {!loading && !error && logs.length > 0 && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="space-y-4">
              {logs.map((log, idx) => {
                const isExpanded = expandedId === log._id
                const claimSummary = log.claims?.reduce(
                  (acc, c) => {
                    acc[c.verdict] = (acc[c.verdict] || 0) + 1
                    return acc
                  },
                  {},
                )

                return (
                  <Motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-panel rounded-xl overflow-hidden border border-border card-hover transition-smooth"
                  >
                    {/* Header row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : log._id)}
                      className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-white/3 transition-smooth"
                    >
                      {/* Timestamp */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <Clock className="w-4 h-4 text-text-tertiary" />
                        <span className="text-xs font-500 text-text-tertiary whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      {/* Preview */}
                      <p className="flex-1 text-sm font-500 text-text-secondary truncate min-w-0">
                        {log.originalResponse?.slice(0, 100)}...
                      </p>

                      {/* Verdict summary */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        {(claimSummary?.verified > 0 || claimSummary?.true > 0) && (
                          <span className="flex items-center gap-1.5 text-xs font-600 text-verified">
                            <ShieldCheck className="w-4 h-4" />{(claimSummary?.verified || 0) + (claimSummary?.true || 0)}
                          </span>
                        )}
                        {claimSummary?.false > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-600 text-verdict-false">
                            <ShieldAlert className="w-4 h-4" />{claimSummary.false}
                          </span>
                        )}
                        {(claimSummary?.unverifiable > 0 || claimSummary?.uncertain > 0) && (
                          <span className="flex items-center gap-1.5 text-xs font-600 text-unverifiable">
                            <ShieldQuestion className="w-4 h-4" />{(claimSummary?.unverifiable || 0) + (claimSummary?.uncertain || 0)}
                          </span>
                        )}
                      </div>

                      {/* Claim count */}
                      <span className="text-xs font-600 text-text-tertiary shrink-0">
                        {log.claims?.length || 0} claims
                      </span>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-6 pb-6 border-t border-border/50"
                      >
                        {/* Original text */}
                        <div className="mt-6 mb-6">
                          <p className="text-xs font-700 text-text-tertiary uppercase tracking-wider mb-3">Original Response</p>
                          <div className="p-4 rounded-lg bg-white/3 border border-white/5">
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-400">
                              {log.originalResponse}
                            </p>
                          </div>
                        </div>

                        {/* Claims table */}
                        {log.claims?.length > 0 && (
                          <div>
                            <p className="text-xs font-700 text-text-tertiary uppercase tracking-wider mb-3.5">Claims</p>
                            <div className="space-y-2.5">
                              {log.claims.map((c, ci) => (
                                <div
                                  key={ci}
                                  className="flex items-start gap-3 p-3.5 rounded-lg bg-white/3 border border-white/5 hover:bg-white/5 transition-smooth"
                                >
                                  {verdictIcon(c.verdict)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-500 text-text-primary">{c.claim}</p>
                                    {c.reason && (
                                      <p className="text-xs text-text-tertiary mt-2">{c.reason}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    {sourceBadge(c.source)}
                                    <span className={`text-xs font-700 uppercase ${verdictColor(c.verdict)}`}>
                                      {c.verdict}
                                    </span>
                                    <span className="text-xs font-600 text-text-tertiary">{c.confidence}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Motion.div>
                    )}
                  </Motion.div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10">
                <p className="text-sm font-500 text-text-tertiary">
                  Page {page} of {totalPages} · {total} total logs
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => loadLogs(page - 1)}
                    disabled={page <= 1}
                    className="p-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-accent transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => loadLogs(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-accent transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </div>
    </div>
  )
}
