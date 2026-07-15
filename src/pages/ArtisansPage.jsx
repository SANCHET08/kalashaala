export default function ArtisansPage() {
  return (
    <div className="pt-20 min-h-screen px-8 py-10">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-6">Our Artisans</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Ramesh Kumar', 'Sunita Devi', 'Arjun Mehra'].map(name => (
          <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                                     hover:shadow-md transition-all">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-display font-semibold text-lg text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 mt-1">Master Artisan · Rajasthan</p>
          </div>
        ))}
      </div>
    </div>
  )
}