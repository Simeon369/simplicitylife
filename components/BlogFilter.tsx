"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, X } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import type { BlogPost, Tag } from "@/types";

interface BlogFilterProps {
  posts: BlogPost[];
  tags: Tag[];
}

const POSTS_PER_PAGE = 9;

export default function BlogFilter({ posts, tags }: BlogFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (selectedTag) {
      result = result.filter((post) =>
        post.tags?.some((t) => t.name === selectedTag),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [posts, selectedTag, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const handleTagClick = (tagName: string | null) => {
    setSelectedTag(tagName);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <>
      <section className="relative py-20 sm:py-32 overflow-hidden max-[425px]:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative max-[425px]:px-3">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 max-[425px]:text-2xl max-[425px]:mb-4">
              Welcome to the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                Blog
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 max-[425px]:text-base max-[425px]:mb-6">
              This isn&apos;t a place for answers. It&apos;s a place for better
              questions.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 max-[425px]:left-3 max-[425px]:w-4 max-[425px]:h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg max-[425px]:pl-10 max-[425px]:pr-10 max-[425px]:py-3 max-[425px]:rounded-xl max-[425px]:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors max-[425px]:right-3"
                  >
                    <X className="w-5 h-5 max-[425px]:w-4 max-[425px]:h-4" />
                  </button>
                )}
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-[425px]:mt-4 max-[425px]:gap-1.5">
                <button
                  onClick={() => handleTagClick(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors max-[425px]:px-3 max-[425px]:py-1.5 max-[425px]:text-xs ${
                    !selectedTag
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {tags.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTagClick(t.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors max-[425px]:px-3 max-[425px]:py-1.5 max-[425px]:text-xs ${
                      selectedTag === t.name
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t.label || t.name}
                  </button>
                ))}
              </div>
            )}

            {(searchQuery || selectedTag) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-gray-500"
              >
                {filteredPosts.length} result
                {filteredPosts.length !== 1 ? "s" : ""} found
                {searchQuery && ` for "${searchQuery}"`}
                {selectedTag && ` in ${selectedTag}`}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 max-[425px]:px-3 max-[425px]:py-8">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {paginatedPosts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 max-[425px]:py-12"
              >
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 max-[425px]:w-12 max-[425px]:h-12 max-[425px]:mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 max-[425px]:text-base">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "No articles published yet. Check back soon!"}
                </h3>
                {(searchQuery || selectedTag) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag(null);
                    }}
                    className="mt-4 text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-[425px]:gap-4"
              >
                {paginatedPosts.map((post, index) => (
                  <BlogCard
                    key={post._id}
                    post={post}
                    index={index}
                    animationDelay={0.05}
                    showViews={false}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10 max-[425px]:mt-6 max-[425px]:gap-1.5 max-[425px]:flex-wrap">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors max-[425px]:px-3 max-[425px]:py-1.5 max-[425px]:text-sm"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-gray-600 max-[425px]:px-3 max-[425px]:py-1.5 max-[425px]:text-sm">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors max-[425px]:px-3 max-[425px]:py-1.5 max-[425px]:text-sm"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
