import { motion } from 'framer-motion'
import { MessageSquareText, Cpu, Search, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: MessageSquareText,
    title: 'Paste LLM Output',
    description: 'Input any AI-generated text — a ChatGPT answer, Gemini summary, or Claude explanation.',
    color: 'text-accent',
    borderColor: 'border-accent/30',
    bgColor: 'bg-accent/8',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'Claim Extraction',
    description: 'Groq-powered LLM identifies and isolates every factual claim from the text.',
    color: 'text-violet-400',
    borderColor: 'border-violet-400/30',
    bgColor: 'bg-violet-400/8',
  },
  {
    num: '03',
    icon: Search,
    title: 'Vector Verification',
    description: 'Each claim is embedded, then matched against verified facts in Pinecone.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/30',
    bgColor: 'bg-cyan-400/8',
  },
  {
    num: '04',
    icon: CheckCircle2,
    title: 'Verdict & Score',
    description: 'Every claim receives a verdict — verified, false, or unverifiable — with confidence.',
    color: 'text-verified',
    borderColor: 'border-verified/30',
    bgColor: 'bg-verified/8',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[140px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-accent font-700 mb-5"
          >
            Pipeline
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-700 tracking-tight mb-6 text-text-primary"
          >
            Four steps to <span className="gradient-text">truth</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            From raw LLM output to evidence-backed verdicts in under two seconds.
          </motion.p>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Step card */}
                <div className="glass-panel rounded-xl p-7 h-full hover:border-border-accent transition-smooth group card-hover border border-border">
                  {/* Number + Icon */}
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className={`
                      w-12 h-12 rounded-lg ${step.bgColor} ${step.borderColor} border
                      flex items-center justify-center shrink-0
                    `}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <span className="text-4xl font-700 text-text-tertiary/30">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-700 mb-3 group-hover:text-accent transition-smooth text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-base text-text-secondary leading-relaxed font-400">
                    {step.description}
                  </p>
                </div>

                {/* Arrow between cards (mobile/tablet) */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-3">
                    <div className="w-px h-6 bg-border" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
