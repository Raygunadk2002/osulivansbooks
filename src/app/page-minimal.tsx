export default function MinimalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          O&apos;Sullivan House
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Shared holiday home booking system
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600">
            This is a minimal version of the page to test if basic routing works.
          </p>
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Admin Login</h3>
              <p className="text-blue-600">Email: admin@osullivanhouse.com</p>
              <p className="text-blue-600">Password: admin123</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">User Login</h3>
              <p className="text-green-600">Email: user@osullivanhouse.com</p>
              <p className="text-green-600">Password: user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
