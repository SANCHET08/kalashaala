export default function SchemesPage() {
  return (
    <div className="pt-20 min-h-screen px-8 py-10">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-6">Government Schemes</h1>
      {['PM Vishwakarma Yojana', 'Mudra Loan Scheme', 'Skill India Mission'].map(s => (
        <div key={s} className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100
                                hover:shadow-md transition-all">
          <h3 className="font-semibold text-gray-900 text-lg">{s}</h3>
          <p className="text-sm text-gray-500 mt-1">Financial support for Indian artisans</p>
          <button className="mt-3 text-sm text-orange-500 font-medium hover:text-orange-600">
            Learn More →
          </button>
        </div>
      ))}
    </div>
  )
}