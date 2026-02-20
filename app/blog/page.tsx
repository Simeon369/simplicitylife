import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { getPostsForBlog, getAllTags } from "@/lib/blogServer";
import { Search, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Tag } from "@/types";

interface BlogPageProps {
  searchParams?: Promise<{
    tag?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const tag = params?.tag ?? null;
  const searchQuery = params?.q ?? "";
  const page = Number(params?.page ?? "1");

  const [{ posts, totalPages, currentPage }, tags] = await Promise.all([
    getPostsForBlog({
      page,
      limit: 9,
      tag: tag || undefined,
      search: searchQuery,
      status: "published",
    }),
    getAllTags(),
  ]);

  const buildUrl = (updates: { tag?: string; page?: number; q?: string }) => {
    const p = new URLSearchParams();
    if (updates.tag) p.set("tag", updates.tag);
    if (updates.q) p.set("q", updates.q);
    if (updates.page && updates.page > 1) p.set("page", String(updates.page));
    const qs = p.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Nav />

      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              This isn&apos;t a place for answers. It&apos;s a place for better questions.
            </p>

            <form action="/blog" method="GET" className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                />
              </div>
              {tag && <input type="hidden" name="tag" value={tag} />}
            </form>

            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Link
                  href={buildUrl({ tag: undefined, q: searchQuery || undefined, page: 1 })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !tag ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </Link>
                {tags.map((t: Tag) => (
                  <Link
                    key={t.id}
                    href={buildUrl({ tag: t.name, q: searchQuery || undefined, page: 1 })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      tag === t.name ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t.label || t.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row w-full items-center gap-8">
          <div className="w-full">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? `No results found for "${searchQuery}"` : "No articles published yet. Check back soon!"}
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <BlogCard
                    key={post._id}
                    post={post}
                    index={index}
                    animationDelay={0.1}
                    showViews={false}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {currentPage > 1 && (
                  <Link
                    href={buildUrl({
                      tag: tag || undefined,
                      q: searchQuery || undefined,
                      page: currentPage - 1,
                    })}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={buildUrl({
                      tag: tag || undefined,
                      q: searchQuery || undefined,
                      page: currentPage + 1,
                    })}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
