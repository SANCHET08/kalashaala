import { MapPin, Star, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ArtisanCard({ artisan }) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm
                    hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border
                    border-gray-100 dark:border-gray-700">

      {/* Image area */}
      <div className="relative h-48 bg-gradient-to-br from-saffron-100 to-terracotta-400/30
                      overflow-hidden">
        {artisan.image ? (
          <img src={artisan.image} alt={artisan.name}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🎨</div>
        )}
        {/* Craft badge */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                        text-saffron-600 text-xs font-semibold px-3 py-1 rounded-full">
          {artisan.craft}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white text-lg">
            {artisan.name}
          </h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {artisan.rating || '4.8'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {artisan.location}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {artisan.bio || 'Master artisan with decades of experience in traditional craft.'}
        </p>

        <Link
          to={`/artisans/${artisan.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 border-2
                     border-saffron-400 text-saffron-600 dark:text-saffron-400 rounded-xl
                     font-medium text-sm hover:bg-saffron-50 dark:hover:bg-saffron-500/10
                     transition-all duration-200 group"
        >
          View Profile
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}