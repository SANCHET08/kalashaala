export default function HomePage() {
  return (
    <div className="pt-16">
      <section className="min-h-screen bg-orange-50 flex items-center px-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl font-bold text-gray-900 leading-tight mb-4">
            Discover & Support<br />
            <span className="text-orange-500">Indian Artisans</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Explore traditional art forms, learn from master artisans, and discover
            government schemes to support your craft.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="/explore-artists" className="btn-primary">Explore Artisans</a>
            <a href="/schemes"  className="btn-outline">Government Schemes</a>
          </div>
        </div>
      </section>
    </div>
  )
}
