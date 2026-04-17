import { motion } from 'framer-motion'
import { Brain, Search, ShieldCheck, BarChart3, Clock, Layers } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Claim Extraction',
    description: 'AI-powered extraction of factual claims from any LLM response using Groq inference.',
    accent: 'from-accent to-accent-hover',
  },
  {
    icon: Search,
    title: 'Vector Verification',
    description: 'Each claim is embedded and matched against a verified knowledge base via Pinecone.',
    accent: 'from-verified to-emerald-300',
  },
  {
    icon: BarChart3,
    title: 'Confidence Scoring',
    description: 'Every claim gets a verdict (verified / false / unverifiable) with a 0-100 confidence score.',
    accent: 'from-unverifiable to-yellow-200',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence-Backed',
    description: 'Results include the source documents and relevance scores for full transparency.',
    accent: 'from-violet-400 to-violet-300',
  },
  {
    icon: Clock,
    title: 'Real-Time Speed',
    description: 'Full pipeline completes in under 2 seconds — fast enough for production middleware.',
    accent: 'from-verdict-false to-rose-300',
  },
  {
    icon: Layers,
    title: 'Audit Trail',
    description: 'Every verification is logged with timestamps for compliance and debugging.',
    accent: 'from-cyan-400 to-cyan-300',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-accent font-700 mb-5"
          >
            Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-700 tracking-tight mb-6 text-text-primary"
          >
            Built for <span className="gradient-text">precision</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Six core capabilities that form a complete hallucination detection pipeline.
          </motion.p>
        </div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`
                group relative rounded-xl border border-border bg-surface p-7
                hover:border-border-accent hover:bg-surface-elevated transition-smooth card-hover
                ${i === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}
                ${i === 3 ? 'lg:col-span-2 lg:row-span-1' : ''}
              `}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5 border border-accent/20 group-hover:border-accent/40 transition-smooth">
                <f.icon className="w-6 h-6 text-accent" />
              </div>

              <h3 className="text-lg font-700 mb-3 text-text-primary group-hover:text-accent transition-smooth">
                {f.title}
              </h3>
              <p className="text-base leading-relaxed font-400">
                {f.description}
              </p>

              {/* Subtle hover glow */}
              <div className="absolute inset-0 rounded-xl bg-accent/5 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
