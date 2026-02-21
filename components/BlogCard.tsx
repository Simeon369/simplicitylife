"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, Eye, BookOpen, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { BlogPost } from "@/types";
import { blocksToPlainText, isTiptapJSON } from "@/components/editor/utils/migratePlainText";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  showViews?: boolean;
  showExcerpt?: boolean;
  showReadingTime?: boolean;
  showDate?: boolean;
  animationDelay?: number;
  className?: string;
  imageHeight?: string;
}

const BlogCard = ({
  post,
  index = 0,
  showViews = true,
  showExcerpt = true,
  showReadingTime = true,
  showDate = true,
  animationDelay = 0.1,
  className = "",
  imageHeight = "h-48",
}: BlogCardProps) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate reading time (supports Tiptap JSON or plain text)
  const calculateReadingTime = (text: string | any) => {
    if (!text) return 0;
    let plainText: string;
    if (typeof text === "object" && text?.content) {
      plainText = blocksToPlainText(text);
    } else if (typeof text === "string") {
      plainText = isTiptapJSON(text)
        ? blocksToPlainText(JSON.parse(text))
        : text;
    } else {
      plainText = "";
    }
    const wordsPerMinute = 200;
    const words = plainText.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  // Get excerpt
  const getExcerpt = (text: string, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * animationDelay }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 max-[425px]:rounded-xl max-[425px]:shadow-md ${className}`}
    >
      {/* Image */}
      <Link href={`/blog/${post.slug}`}>
        <div className={`relative ${imageHeight} overflow-hidden`}>
          {post.headerImage ? (
            <Image
              src={post.headerImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400 max-[425px]:w-10 max-[425px]:h-10" />
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-[425px]:top-2 max-[425px]:left-2 max-[425px]:gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white max-[425px]:px-2 max-[425px]:py-0.5 max-[425px]:text-[10px]"
                >
                  {tag.label || tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 max-[425px]:p-4">
        {/* Meta Information */}
        {(showDate || showReadingTime || showViews) && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 mb-3 max-[425px]:gap-2 max-[425px]:text-xs max-[425px]:mb-2">
            {showDate && post.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.createdAt)}
              </span>
            )}

            {showReadingTime && post.body && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {calculateReadingTime(post.body)} min read
              </span>
            )}

            {showViews && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views?.toLocaleString() || 0} views
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 max-[425px]:text-base max-[425px]:mb-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {showExcerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 max-[425px]:text-sm max-[425px]:mb-3">
            {post.excerpt ||
              getExcerpt(typeof post.body === "string" ? post.body : "", 100)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between max-[425px]:gap-2">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all max-[425px]:text-xs"
          >
            Read More
            <ChevronRight className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
          </Link>

          {/* Draft Badge */}
          {post.status === "draft" && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full max-[425px]:px-1.5 max-[425px]:py-0.5 max-[425px]:text-[10px]">
              Draft
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
