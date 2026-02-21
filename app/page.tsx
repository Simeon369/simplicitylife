import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import BlogCard from "@/components/BlogCard"
import { blogAPI } from "@/services/api"
import { ArrowRight, BookOpen, Feather } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  // Fetch recent posts on server
  const recentPostsResponse = await blogAPI.getRecentPosts(6)
  const recentPosts = recentPostsResponse.data || []
  
  // Fetch stats on server
  const statsResponse = await blogAPI.getStats()
  const stats = statsResponse.data || { totalPosts: 0, totalViews: 0 }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Nav />
      
      <section className="relative h-screen flex justify-center items-center lg:py-32 overflow-hidden bg-gradient-to-br from-gray-50 to-white max-[425px]:py-16">
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container mx-auto px-6 relative max-[425px]:px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold mb-2 tracking-tight max-[425px]:text-2xl max-[425px]:mb-1" style={{ fontFamily: "var(--font-logo)" }}>
              SIMPLICITY
            </h1>

            <p className="text-lg md:text-2xl text-gray-600 mb-5 max-w-2xl mx-auto leading-relaxed max-[425px]:text-base max-[425px]:mb-4">
              Order in a chaotic world.
            </p>

            <div className="flex flex-wrap gap-4 justify-center max-[425px]:gap-3">
              <Link href="/about">
                <button className="px-8 py-3 bg-black text-sm md:text-base text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 group max-[425px]:px-5 max-[425px]:py-2 max-[425px]:text-xs max-[425px]:rounded-lg max-[425px]:gap-1.5">
                  WHO AM I
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform max-[425px]:w-4 max-[425px]:h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white max-[425px]:py-10">
        <div className="container mx-auto px-6 max-[425px]:px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12 max-[425px]:mb-8">
              <h2 className="text-4xl font-light text-gray-900 mb-4 max-[425px]:text-2xl max-[425px]:mb-3" style={{fontFamily: "var(--font-logo)"}}>
                SIMPLICITY
              </h2>
              <div className="w-20 h-px bg-gray-300 mx-auto max-[425px]:w-12"></div>
            </div>

            <div className="text-center space-y-6 max-[425px]:space-y-4">
              <p className="text-lg text-gray-700 max-[425px]:text-base">
                A reflective journal for clear thinking and honest writing.
              </p>

              <div className="space-y-3 max-[425px]:space-y-2">
                <p className="text-gray-600 max-[425px]:text-sm">
                  Not for noise. Not for performance.
                </p>
                <p className="text-gray-600 max-[425px]:text-sm">
                  For clarity. For depth. For intentional living.
                </p>
              </div>

              <div className="pt-8 max-[425px]:pt-5">
                <p className="text-gray-500 text-sm max-[425px]:text-xs">
                  Written slowly. Read gently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white max-[425px]:py-8">
        <div className="container mx-auto px-6 max-[425px]:px-4">
          <div className="flex items-center justify-between mb-10 max-[425px]:mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 max-[425px]:text-xl max-[425px]:mb-1">
                Latest Reflections
              </h2>
              <p className="text-gray-500 max-[425px]:text-sm">Fresh thoughts from the journal</p>
            </div>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 max-[425px]:text-sm"
            >
              View all
              <ArrowRight className="w-5 h-5 max-[425px]:w-4 max-[425px]:h-4" />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="text-center py-20 max-[425px]:py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 max-[425px]:w-12 max-[425px]:h-12 max-[425px]:mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 max-[425px]:text-base">
                No reflections yet
              </h3>
              <p className="text-gray-500 max-[425px]:text-sm">Check back soon for new thoughts</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-[425px]:gap-5">
              {recentPosts.map((post, index) => (
                <BlogCard key={post._id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50 max-[425px]:py-10">
        <div className="container mx-auto px-6 max-[425px]:px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-6 max-[425px]:px-3 max-[425px]:py-1.5 max-[425px]:text-xs max-[425px]:mb-4">
              <Feather className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />A Final Thought
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 max-[425px]:text-xl max-[425px]:mb-4">
              This isn't a place for answers.
            </h2>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-[425px]:text-base max-[425px]:mb-6">
              It's a place for better questions. For quiet reflection. For the
              kind of thinking that happens when you remove the noise and listen
              to what remains.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-[425px]:gap-3">
              <Link href="/blog">
                <button className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors max-[425px]:px-5 max-[425px]:py-2 max-[425px]:text-sm max-[425px]:rounded-lg">
                  Start Reading
                </button>
              </Link>

              <Link href="/about">
                <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors max-[425px]:px-5 max-[425px]:py-2 max-[425px]:text-sm max-[425px]:rounded-lg">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}