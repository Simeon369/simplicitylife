'use client'

import React, { useEffect, useCallback, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import BubbleMenu from "@tiptap/extension-bubble-menu"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Dropcursor from "@tiptap/extension-dropcursor"
import { common, createLowlight } from "lowlight"

import BubbleToolbar from "./BubbleToolbar"
import { uploadImage } from "@/services/api"
import "./editor-styles.css" // Add this import

const lowlight = createLowlight(common)

interface MediumEditorProps {
  initialContent?: any
  onContentChange?: (content: any) => void
  onAutoSave?: (content: any) => void
  placeholder?: string
  editable?: boolean
}

const MediumEditor = ({
  initialContent = null,
  onContentChange,
  onAutoSave,
  placeholder = "Tell your story...",
  editable = true,
}: MediumEditorProps) => {
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Wait for component to mount on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    // Validate file
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      console.error("Invalid file type")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("File too large")
      return
    }

    try {
      // Show loading placeholder
      const reader = new FileReader()
      reader.onload = async (e) => {
        const tempSrc = e.target?.result as string
        
        // Insert temporary image
        editor?.chain().focus().setImage({ src: tempSrc, alt: file.name }).run()

        // Upload to Supabase
        try {
          const publicUrl = await uploadImage(file)
          
          // Find and update the image with the real URL
          const { state } = editor!
          const { doc } = state
          let imagePos: number | null = null

          doc.descendants((node, pos) => {
            if (node.type.name === "image" && node.attrs.src === tempSrc) {
              imagePos = pos
              return false
            }
          })

          if (imagePos !== null) {
            editor?.chain().setNodeSelection(imagePos).updateAttributes("image", { src: publicUrl }).run()
          }
        } catch (uploadError) {
          console.error("Upload failed:", uploadError)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Image handling error:", error)
    }
  }, [])

  // Configure the editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      BubbleMenu.configure({
        pluginKey: "bubbleMenu",
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "Heading..."
          }
          return placeholder
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "medium-editor-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "medium-editor-link",
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "medium-editor-code-block",
        },
      }),
      Dropcursor.configure({
        color: "#0a0a0a",
        width: 2,
      }),
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "medium-editor-content prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith("image/")) {
            event.preventDefault()
            handleImageUpload(file)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) {
                handleImageUpload(file)
                return true
              }
            }
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onContentChange?.(json)
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        onAutoSave?.(json)
      }, 2000)
    },
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Update content when initialContent changes
  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON())
      const newContent = JSON.stringify(initialContent)
      if (currentContent !== newContent) {
        editor.commands.setContent(initialContent)
      }
    }
  }, [editor, initialContent])

  // Don't render editor until mounted on client
  if (!isMounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center border border-gray-200 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading editor...</div>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center border border-gray-200 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="medium-editor-wrapper relative border border-gray-200 rounded-lg bg-white">
      {/* Bubble Menu for text formatting */}
      <BubbleToolbar editor={editor} />
      
      {/* Main editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}

export default MediumEditor