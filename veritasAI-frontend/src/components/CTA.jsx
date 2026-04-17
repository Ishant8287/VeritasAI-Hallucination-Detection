import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border-accent"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-linear-to-br from-surface via-surface-elevated to-surface" />
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent-secondary/4 blur-[80px]" />

          <div className="relative z-10 px-8 sm:px-16 py-16 sm:py-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Free to use during beta
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-2xl mx-auto leading-[1.15]">
              Ready to separate{' '}
              <span className="gradient-text">fact from fiction?</span>
            </h2>

            <p className="text-text-secondary text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              Paste any LLM response and get instant, evidence-backed verdicts. 
              No signup required. No API key needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/verify"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl btn-primary font-semibold text-base"
              >
                Start Verifying
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/logs"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-text-tertiary transition-colors font-medium text-sm"
              >
                View Audit Logs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
