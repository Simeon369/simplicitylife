export default function CreatePostLoading() {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-9 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                <div className="h-9 bg-gray-200 rounded-lg w-28 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="space-y-8">
            {/* Image Upload Skeleton */}
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
  
            {/* Category Selector Skeleton */}
            <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse"></div>
  
            {/* Title Input Skeleton */}
            <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
  
            {/* Editor Skeleton */}
            <div className="min-h-[400px] bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }