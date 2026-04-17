import { Link } from 'react-router-dom'
import { Shield, ExternalLink, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-base">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="font-body text-lg font-600 tracking-tight">
                Veritas<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-text-secondary text-base leading-relaxed max-w-sm font-400">
              Real-time hallucination detection middleware for LLMs. Verify AI-generated claims with evidence-backed scoring.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-700 uppercase tracking-wider text-text-tertiary mb-5">
              Product
            </h4>
            <div className="space-y-4">
              <Link
                to="/verify"
                className="block text-base text-text-secondary hover:text-text-primary transition-smooth font-500"
              >
                Verify
              </Link>
              <Link
                to="/logs"
                className="block text-base text-text-secondary hover:text-text-primary transition-smooth font-500"
              >
                Audit Logs
              </Link>
              <a
                href="#features"
                className="block text-base text-text-secondary hover:text-text-primary transition-smooth font-500"
              >
                Features
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-700 uppercase tracking-wider text-text-tertiary mb-5">
              Connect
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Ishant8287/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-accent transition-smooth"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ishant-singh-cse/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-accent transition-smooth"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-text-tertiary font-500">
            &copy; {new Date().getFullYear()} VeritasAI. Built for truth.
          </p>
          <p className="text-sm text-text-tertiary font-500">
            Powered by Groq &middot; Pinecone &middot; MiniLM
          </p>
        </div>
      </div>
    </footer>
  );
}
