'use client'

import React from "react"
import { isTiptapJSON, migratePlainTextToBlocks } from "./utils/migratePlainText"

interface TextNodeProps {
  node: any
}

interface BlockNodeProps {
  node: any
}

const TextNode = ({ node }: TextNodeProps) => {
  if (!node) return null

  let content: any = node.text || ""

  // Apply marks (formatting)
  if (node.marks && node.marks.length > 0) {
    node.marks.forEach((mark: any) => {
      switch (mark.type) {
        case "bold":
          content = <strong key="bold">{content}</strong>
          break
        case "italic":
          content = <em key="italic">{content}</em>
          break
        case "underline":
          content = <u key="underline">{content}</u>
          break
        case "strike":
          content = <s key="strike">{content}</s>
          break
        case "code":
          content = (
            <code
              key="code"
              className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {content}
            </code>
          )
          break
        case "link":
          content = (
            <a
              key="link"
              href={mark.attrs?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              {content}
            </a>
          )
          break
        case "highlight":
          content = (
            <mark key="highlight" className="bg-yellow-200 px-0.5 rounded">
              {content}
            </mark>
          )
          break
        default:
          break
      }
    })
  }

  return <>{content}</>
}

const renderContent = (content: any[]) => {
  if (!content || !Array.isArray(content)) return null

  return content.map((node, index) => {
    if (node.type === "text") {
      return <TextNode key={index} node={node} />
    }
    return <BlockNode key={index} node={node} />
  })
}

const BlockNode = ({ node }: BlockNodeProps) => {
  if (!node) return null

  switch (node.type) {
    case "paragraph":
      return (
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          {renderContent(node.content)}
        </p>
      )

    case "heading":
      const HeadingTag = `h${node.attrs?.level || 2}` as keyof JSX.IntrinsicElements
      const headingClasses: Record<number, string> = {
        1: "text-4xl font-bold mt-10 mb-4 text-gray-900",
        2: "text-3xl font-bold mt-8 mb-3 text-gray-900",
        3: "text-2xl font-semibold mt-6 mb-2 text-gray-900",
      }
      return (
        <HeadingTag
          className={headingClasses[node.attrs?.level] || headingClasses[2]}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {renderContent(node.content)}
        </HeadingTag>
      )

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-gray-900 pl-6 my-8 text-xl italic text-gray-600">
          {renderContent(node.content)}
        </blockquote>
      )

    case "bulletList":
      return (
        <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-lg text-gray-700">
          {node.content?.map((item: any, index: number) => (
            <li key={index}>{renderContent(item.content)}</li>
          ))}
        </ul>
      )

    case "orderedList":
      return (
        <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-lg text-gray-700">
          {node.content?.map((item: any, index: number) => (
            <li key={index}>{renderContent(item.content)}</li>
          ))}
        </ol>
      )

    case "listItem":
      return <>{renderContent(node.content)}</>

    case "codeBlock":
      const codeText = node.content
        ?.map((n: any) => n.text || "")
        .join("")
        || ""
      return (
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-6 text-sm">
          <code className="font-mono">{codeText}</code>
        </pre>
      )

    case "image":
      return (
        <figure className="my-8">
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || ""}
            className="w-full rounded-lg shadow-md"
          />
          {node.attrs?.alt && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {node.attrs.alt}
            </figcaption>
          )}
        </figure>
      )

    case "horizontalRule":
      return <hr className="my-10 border-t border-gray-200" />

    case "hardBreak":
      return <br />

    default:
      // For unknown node types, try to render content if it exists
      if (node.content) {
        return <>{renderContent(node.content)}</>
      }
      return null
  }
}

interface BlockRendererProps {
  content: any
  className?: string
}

/**
 * Main BlockRenderer component
 * Accepts either Tiptap JSON or plain text and renders appropriately
 */
const BlockRenderer = ({ content, className = "" }: BlockRendererProps) => {
  // Handle empty content
  if (!content) {
    return null
  }

  // Parse content if it's a string
  let parsedContent = content

  if (typeof content === "string") {
    // Check if it's JSON
    if (isTiptapJSON(content)) {
      try {
        parsedContent = JSON.parse(content)
      } catch {
        // If parsing fails, treat as plain text
        parsedContent = migratePlainTextToBlocks(content)
      }
    } else {
      // Plain text - convert to blocks for rendering
      parsedContent = migratePlainTextToBlocks(content)
    }
  }

  // Ensure we have a valid document structure
  if (!parsedContent || !parsedContent.content) {
    return null
  }

  return (
    <div className={`block-renderer ${className}`}>
      {parsedContent.content.map((node: any, index: number) => (
        <BlockNode key={index} node={node} />
      ))}
    </div>
  )
}

export default BlockRenderer