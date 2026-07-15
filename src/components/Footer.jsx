import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center">
      <div className="font-display font-bold text-xl text-white mb-2">
        Kala<span className="text-orange-400">Shaala</span>
      </div>
      <p className="text-sm mb-4">Preserving India's craft heritage, one artisan at a time.</p>
      <div className="flex justify-center gap-6 text-sm">
        <Link to="/explore-artists" className="hover:text-orange-400 transition">Artisans</Link>
        <Link to="/schemes"  className="hover:text-orange-400 transition">Schemes</Link>
        <Link to="/login"    className="hover:text-orange-400 transition">Login</Link>
      </div>
      <p className="text-xs mt-6 text-gray-600">© 2025 KalaShaala. All rights reserved.</p>
    </footer>
  )
}
