export default function Loader({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizes[size]} rounded-full border-2 border-border`} />
        {/* Spinning arc */}
        <div
          className={`${sizes[size]} rounded-full border-2 border-transparent border-t-accent border-r-accent absolute inset-0 animate-spin`}
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-accent to-accent-secondary" />
        </div>
      </div>
      {text && (
        <p className="text-base text-text-secondary font-500">{text}</p>
      )}
    </div>
  )
}
