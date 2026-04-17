import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/verify', label: 'Verify' },
  { to: '/logs', label: 'Audit Logs' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-base/80 backdrop-blur-sm border-b border-border">
      {/* Nav bar */}
      <nav className="mx-auto max-w-7xl px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/15 transition-smooth">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <span className="font-body text-lg font-600 tracking-tight text-text-primary">
              Veritas<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {links.map(({ to, label }) => {
              const isActive = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`
                    relative px-3.5 py-2 rounded-lg text-sm font-500 transition-smooth
                    ${isActive
                      ? 'text-text-primary bg-accent/10'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              to="/verify"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-sm font-500"
            >
              Try Now
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-elevated transition-smooth text-text-secondary"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-3 pt-3 border-t border-border space-y-1"
            >
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`
                    block px-3.5 py-2.5 rounded-lg text-sm font-500 transition-smooth
                    ${pathname === to
                      ? 'text-text-primary bg-accent/10'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/verify"
                onClick={() => setOpen(false)}
                className="block text-center mt-3 px-4 py-2.5 rounded-lg btn-primary text-sm font-500"
              >
                Try Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
