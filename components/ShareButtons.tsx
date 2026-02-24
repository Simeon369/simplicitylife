"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Link as LinkIcon } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title,
        text: title,
        url,
      });
    } catch {
      // user dismissed share sheet; ignore
    }
  };

  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        {canUseNativeShare && (
          <motion.button
            type="button"
            onClick={handleNativeShare}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
        )}

        <motion.button
          type="button"
          onClick={handleCopy}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {copied ? "Copied" : "Copy link"}
          </span>
        </motion.button>
      </div>

      <span className="hidden sm:flex items-center gap-1 text-gray-400">
        <LinkIcon className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px] md:max-w-[200px]">
          {url.replace(/^https?:\/\//, "")}
        </span>
      </span>
    </div>
  );
}

