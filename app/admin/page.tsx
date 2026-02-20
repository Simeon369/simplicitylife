"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, type AuthState } from "@/store/authStore";
import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  FileEdit,
  Eye,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Nav from "@/components/Nav";
import RequireAuth from "@/components/auth/RequireAuth";
import { authFetch } from "@/lib/authFetch";
import type { ApiResponse, BlogPost } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Post = BlogPost;

interface Stats {
  total: number;
  published: number;
  drafts: number;
  views: number;
}

export default function Admin() {
  const user = useAuthStore((state: AuthState) => state.user);
  const clearSession = useAuthStore((state: AuthState) => state.clearSession);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    drafts: 0,
    views: 0,
  });

  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const isAdmin = useAuthStore((state: AuthState) => state.isAdmin);
  const getToken = useAuthStore((state: AuthState) => state.getToken);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !getToken()) return;
    fetchPosts();
  }, [isAuthenticated, isAdmin]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await authFetch("/api/posts?status=all&page=1&limit=100", {
        cache: "no-store",
      });
      const response: ApiResponse<BlogPost[]> = await res.json();

      if (res.status === 401) {
        clearSession();
        router.replace("/login?redirect=" + encodeURIComponent("/admin"));
        return;
      }

      if (!res.ok || !response.success || !response.data) {
        throw new Error(response.error || "Failed to load posts");
      }

      const allPosts = response.data;
      setPosts(allPosts);

      const publishedPosts = allPosts.filter(
        (post: Post) => post.status === "published",
      );
      const draftPosts = allPosts.filter(
        (post: Post) => post.status === "draft",
      );
      const totalViews = allPosts.reduce(
        (sum: number, post: Post) => sum + (post.views || 0),
        0,
      );

      setStats({
        total: allPosts.length,
        published: publishedPosts.length,
        drafts: draftPosts.length,
        views: totalViews,
      });
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts =
    activeTab === "all"
      ? posts
      : posts.filter((post) => post.status === activeTab);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExcerpt = (text: string, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedPost) return;

      const res = await authFetch(
        `/api/posts/${selectedPost._id || selectedPost.id}`,
        { method: "DELETE" },
      );
      const json: ApiResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete post");
      }

      // Update local state
      setPosts(
        posts.filter(
          (p) => (p._id || p.id) !== (selectedPost._id || selectedPost.id),
        ),
      );
      setShowDeleteModal(false);
      setSelectedPost(null);

      // Recalculate stats
      const remainingPosts = posts.filter(
        (p) => (p._id || p.id) !== (selectedPost._id || selectedPost.id),
      );
      const publishedPosts = remainingPosts.filter(
        (post) => post.status === "published",
      );
      const draftPosts = remainingPosts.filter(
        (post) => post.status === "draft",
      );
      const totalViews = remainingPosts.reduce(
        (sum, post) => sum + (post.views || 0),
        0,
      );

      setStats({
        total: remainingPosts.length,
        published: publishedPosts.length,
        drafts: draftPosts.length,
        views: totalViews,
      });
    } catch (err: any) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again.");
      setShowDeleteModal(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your blog posts and content
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Total Posts",
              value: stats.total,
              Icon: FileText,
              color: "blue",
            },
            {
              label: "Published",
              value: stats.published,
              Icon: CheckCircle,
              color: "green",
            },
            {
              label: "Drafts",
              value: stats.drafts,
              Icon: FileEdit,
              color: "yellow",
            },
            {
              label: "Total Views",
              value: stats.views.toLocaleString(),
              Icon: Eye,
              color: "purple",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.Icon className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Link href="/create-post">
            <motion.button
              className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create New Post
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            {[
              { id: "all", label: "All Posts" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Drafts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading posts...
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch your content
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === "all" ? "No posts yet" : `No ${activeTab} posts`}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all"
                  ? "Start creating content to share with your audience"
                  : `You don't have any ${activeTab} posts yet`}
              </p>
              <Link href="/create-post">
                <motion.button
                  className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Create New Post
                </motion.button>
              </Link>
            </div>
          ) : (
            <AnimatePresence>
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {post.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt ||
                          getExcerpt(
                            typeof post.body === "string" ? post.body : "",
                          )}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(post.views || 0).toLocaleString()} views
                        </span>
                        {post.tags?.length ? (
                          <span className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((t) => (
                              <span
                                key={t.id}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {t.label || t.name}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 sm:gap-2">
                      <Link
                        href={`/edit-post/${post._id || post.id}`}
                        className="flex-1 sm:flex-none"
                      >
                        <motion.button
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </motion.button>
                      </Link>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex-1 sm:flex-none"
                      >
                        <motion.button
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => handleDelete(post)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Post?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedPost?.title}"? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </RequireAuth>
  );
}
