import Nav from "@/components/Nav"

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Nav />
      
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="h-16 bg-gray-200 rounded-lg w-64 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto mb-10 animate-pulse"></div>
            
            <div className="max-w-2xl mx-auto">
              <div className="h-14 bg-gray-200 rounded-2xl w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}