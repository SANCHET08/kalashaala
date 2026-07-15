import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import ArtisanCard from './ArtisanCard'
import axios from 'axios'

const CRAFTS = ['All', 'Weaving', 'Pottery', 'Painting', 'Sculpture', 'Embroidery', 'Woodcraft']

export default function ArtisansSection() {
  const [artisans,  setArtisans]  = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [search,    setSearch]    = useState('')
  const [activeCraft, setActiveCraft] = useState('All')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    axios.get('/api/artisans/')
      .then(res => {
        setArtisans(res.data)
        setFiltered(res.data)
      })
      .catch(() => {
        // Fallback demo data
        const demo = Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          name: ['Ramesh Kumar', 'Sunita Devi', 'Arjun Mehra',
                 'Priya Nair',  'Ratan Singh', 'Meena Kumari'][i],
          craft: CRAFTS[i + 1] || 'Weaving',
          location: ['Bihar', 'Rajasthan', 'UP', 'Kerala', 'Gujarat', 'Odisha'][i],
          rating: (4.5 + Math.random() * 0.5).toFixed(1),
          bio: 'Master artisan crafting traditional works passed down through generations.',
        }))
        setArtisans(demo)
        setFiltered(demo)
      })
      .finally(() => setLoading(false))
  }, [])

  // Live filter
  useEffect(() => {
    let result = artisans
    if (activeCraft !== 'All') result = result.filter(a => a.craft === activeCraft)
    if (search) result = result.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, activeCraft, artisans])

  return (
    <section id="artisans" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <span className="text-saffron-500 font-medium text-sm uppercase tracking-widest">
            Our Community
          </span>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Featured Artisans
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Discover master craftspeople from every corner of India,
            each carrying centuries of tradition in their hands.
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8" data-aos="fade-up" data-aos-delay="100">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search artisans by name or state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900
                         dark:text-white placeholder-gray-400 focus:outline-none
                         focus:ring-2 focus:ring-saffron-400 transition-all"
            />
          </div>

          {/* Filter icon */}
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600
                             dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>

        {/* Craft Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide" data-aos="fade-up" data-aos-delay="150">
          {CRAFTS.map(craft => (
            <button
              key={craft}
              onClick={() => setActiveCraft(craft)}
              className={`
                flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${activeCraft === craft
                  ? 'bg-saffron-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}
            >
              {craft}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100
                                     dark:border-gray-700 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-4">🎨</div>
            <p className="font-display text-xl">No artisans found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((artisan, i) => (
              <div key={artisan.id} data-aos="fade-up" data-aos-delay={i * 80}>
                <ArtisanCard artisan={artisan} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}