export default function AdminLoading() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
          </div>
  
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-lg w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
              </div>
            ))}
          </div>
  
          {/* Posts Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-3"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 rounded-lg w-20"></div>
                      <div className="h-3 bg-gray-200 rounded-lg w-16"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }