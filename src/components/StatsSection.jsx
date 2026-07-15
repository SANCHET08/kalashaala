import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
          start = Math.min(start + step, target)
          setCount(Math.floor(start))
          if (start >= target) clearInterval(timer)
        }, 16)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

const STATS = [
  { value: 500, suffix: '+', label: 'Registered Artisans',    desc: 'Across all states of India' },
  { value: 30,  suffix: '',  label: 'States Covered',          desc: 'Nationwide reach' },
  { value: 200, suffix: '+', label: 'Art Forms Documented',    desc: 'Traditional & folk crafts' },
  { value: 50,  suffix: '+', label: 'Government Schemes',      desc: 'Funding & support programs' },
]

function StatItem({ value, suffix, label, desc }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-5xl font-bold text-saffron-500 mb-1">
        {count}{suffix}
      </div>
      <div className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{label}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
    </div>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-saffron-50 to-cream dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map(s => <StatItem key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  )
}