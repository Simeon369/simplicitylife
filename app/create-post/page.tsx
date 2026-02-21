"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  X,
  Eye,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";
import SimpleEditor from "@/components/editor/SimpleEditor";
import RequireAuth from "@/components/auth/RequireAuth";
import { useEditorStore } from "@/store/editorStore";
import { authFetch } from "@/lib/authFetch";
import type { Tag } from "@/types";

export default function CreatePost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    title,
    body,
    tags,
    headerImageFile,
    headerImagePreview,
    status,
    autoSaveStatus,
    setTitle,
    setBody,
    setTags,
    setHeaderImageFile,
    setStatus,
    setAutoSaveStatus,
    reset,
  } = useEditorStore();

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // load tags
    const loadTags = async () => {
      try {
        const res = await authFetch("/api/tags");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAvailableTags(json.data);
        }
      } catch (err) {
        console.error("Failed to load tags", err);
      }
    };
    loadTags();
    setStatus("draft");
    return () => reset();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImageFile(file, reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setHeaderImageFile(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle editor content changes
  const handleContentChange = useCallback((content: any) => {
    setBody(content);
  }, []);

  // Handle auto-save
  const handleAutoSave = useCallback((content: any) => {
    setAutoSaveStatus("saving");
    setTimeout(() => setAutoSaveStatus("saved"), 500);
  }, []);

  const handleSubmit = async (status: "draft" | "published") => {
    setStatus(status);
    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!body || !body.content || body.content.length === 0) {
      setError("Body content is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Generate slug
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      // Generate excerpt from JSON content
      const { generateExcerpt } =
        await import("@/components/editor/utils/migratePlainText");
      const excerpt = generateExcerpt(body, 150);

      let headerImageUrl: string | null = null;
      if (headerImageFile) {
        const formData = new FormData();
        formData.append("file", headerImageFile);
        const res = await authFetch("/api/images", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Header image upload failed");
        }
        headerImageUrl = json.url;
      }

      const res = await authFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          excerpt,
          status,
          slug,
          headerImageUrl,
          tags: tags.map((t: Tag) => t.id),
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        reset();
        router.push("/admin");
      } else {
        setError(json.error || "Failed to create post");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);

      if (error.message?.includes("logged in")) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(error.message || "Failed to create post. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form is valid for submission
  const isValidForDraft = title.trim();
  const isValidForPublish = isValidForDraft && body?.content?.length > 0;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        {/* Error Alert */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <motion.button
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
            </Link>

            <div className="flex items-center gap-3">
              {/* Auto-save status */}
              {autoSaveStatus && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-400 flex items-center gap-1"
                >
                  {autoSaveStatus === "saving" ? (
                    <>
                      <Loader size="xs" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Saved
                    </>
                  )}
                </motion.span>
              )}

              <motion.button
                onClick={() => handleSubmit("draft")}
                disabled={isSaving || !isValidForDraft}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? (
                  <Loader size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save Draft</span>
              </motion.button>

              <motion.button
                onClick={() => handleSubmit("published")}
                disabled={isSaving || !isValidForPublish}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? (
                  <Loader size="sm" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Publish</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header Image Section */}
          <div className="relative">
            {headerImagePreview ? (
              <div className="relative group rounded-xl overflow-hidden">
                <img
                  src={headerImagePreview}
                  alt="Header preview"
                  className="w-full h-64 sm:h-96 object-cover"
                />
                <motion.button
                  onClick={removeImage}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-48 sm:h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
              >
                <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  Add header image
                </p>
                <p className="text-sm text-gray-400">
                  Click to upload (JPEG, PNG, GIF, WebP - Max 5MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Category Selector */}
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag: Tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-black text-white"
                >
                  {tag.label || tag.name}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {tags.length ? "Edit tags" : "Add tags"}
              </button>
            </div>

            {showTagDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1"
              >
                {availableTags.map((tag: Tag) => {
                  const isSelected = !!tags.find(
                    (selected: Tag) => selected.id === tag.id,
                  );
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTags(
                            tags.filter(
                              (selected: Tag) => selected.id !== tag.id,
                            ),
                          );
                        } else {
                          setTags([...tags, tag]);
                        }
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded ${
                        isSelected ? "bg-black text-white" : "hover:bg-gray-50"
                      }`}
                    >
                      {tag.label || tag.name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <textarea
              placeholder="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              className="w-full text-4xl sm:text-5xl font-bold placeholder-gray-300 border-none focus:outline-none focus:ring-0 resize-none bg-transparent leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
              rows={2}
            />
          </div>

          {/* Medium-Style Editor */}
          <div className="min-h-[400px]">
            <SimpleEditor placeholder="Tell your story..." />
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 p-6 bg-gray-50 border border-gray-100 rounded-xl"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            Writing Tips
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              • Use <strong>/</strong> to insert different block types
              (headings, images, quotes, code)
            </li>
            <li>
              • Select text to reveal formatting options (bold, italic, links)
            </li>
            <li>• Drag and drop images directly into the editor</li>
            <li>
              • Use keyboard shortcuts:{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                Ctrl+B
              </kbd>{" "}
              for bold,{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                Ctrl+I
              </kbd>{" "}
              for italic
            </li>
            <li>• Your work is auto-saved as you type</li>
          </ul>
        </motion.div>
      </div>
    </div>
    </RequireAuth>
  );
}
