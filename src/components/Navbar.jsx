import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Moon, Sun } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const [dark,      setDark]      = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  const links = [
    { label: 'Home',     path: '/' },
    { label: 'Discovery', path: '/artisan-discovery' },
    { label: 'Artisans', path: '/explore-artists' },
    { label: 'Schemes',  path: '/schemes' },
    { label: 'Login',    path: '/login' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white'}
      dark:bg-gray-900`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        <Link to="/" className="font-display font-bold text-xl text-gray-900 dark:text-white">
          Kala<span className="text-orange-500">Shaala</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.path} to={l.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${location.pathname === l.path
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
              {l.label}
            </Link>
          ))}
          <button onClick={toggleDark}
            className="ml-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/signup" className="ml-2 btn-primary text-sm py-2 px-4">Sign Up</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600
                         dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
