import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'

const ROTATING_WORDS = ['Artisans', 'Weavers', 'Potters', 'Painters', 'Sculptors']

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  // Rotating word animation
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATING_WORDS.length)
        setVisible(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream dark:bg-gray-950">

      {/* Background Pattern (Indian mandala-inspired) */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E07B39' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-saffron-100 rounded-full
                      blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-terracotta-400/20 rounded-full
                      blur-2xl opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32 grid
                      lg:grid-cols-2 gap-12 items-center">

        {/* Left: Text */}
        <div>
          <div className="inline-flex items-center gap-2 bg-saffron-50 dark:bg-saffron-500/10
                          text-saffron-600 dark:text-saffron-400 text-sm font-medium px-4 py-1.5
                          rounded-full mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse" />
            India's Artisan Community Platform
          </div>

          <h1 className="font-display text-5xl lg:text-6xl font-bold text-gray-900
                         dark:text-white leading-tight mb-4">
            Discover &amp; Support
            <br />
            Indian{' '}
            <span
              className={`text-saffron-500 transition-all duration-300 inline-block
                          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
            Explore traditional art forms, learn from master artisans, and discover
            government schemes to support and grow your craft across India.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mb-10">
            {[
              { num: '500+', label: 'Artisans' },
              { num: '30',   label: 'States' },
              { num: '200+', label: 'Art Forms' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-saffron-500">{s.num}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to="/explore-artists" className="btn-primary flex items-center gap-2 group">
              Explore Artisans
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/schemes" className="btn-outline">
              Government Schemes
            </Link>
          </div>
        </div>

        {/* Right: Art cards visual */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          {[
            { title: 'Madhubani Painting', state: 'Bihar',        color: 'from-orange-100 to-red-100',    emoji: '🎨' },
            { title: 'Banarasi Weaving',   state: 'Uttar Pradesh', color: 'from-indigo-100 to-purple-100', emoji: '🧵' },
            { title: 'Blue Pottery',       state: 'Rajasthan',    color: 'from-blue-100 to-cyan-100',     emoji: '🏺' },
            { title: 'Tanjore Painting',   state: 'Tamil Nadu',   color: 'from-yellow-100 to-amber-100',  emoji: '✨' },
          ].map((card, i) => (
            <div
              key={card.title}
              className={`
                bg-gradient-to-br ${card.color} rounded-2xl p-5 border border-white/60
                shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300
                cursor-pointer animate-fade-up
              `}
              style={{ animationDelay: `${i * 0.1 + 0.3}s`, animationFillMode: 'both' }}
            >
              <div className="text-3xl mb-3">{card.emoji}</div>
              <div className="font-display font-semibold text-gray-800 text-sm leading-tight">
                {card.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">{card.state}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#artisans"
         className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                    items-center gap-1 text-gray-400 hover:text-saffron-500 transition-colors">
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  )
}
