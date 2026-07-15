export default function SignupPage() {
  return (
    <div className="pt-20 min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <h1 className="font-display text-2xl font-bold text-gray-900 text-center mb-6">
          Create Account
        </h1>
        <div className="space-y-4">
          <input type="text" placeholder="Full Name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          <input type="email" placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          <input type="password" placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          <button className="w-full btn-primary py-3">Create Account</button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <a href="/login" className="text-orange-500 font-medium">Login</a>
        </p>
      </div>
    </div>
  )
}