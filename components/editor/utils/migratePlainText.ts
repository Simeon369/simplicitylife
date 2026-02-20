/**
 * Converts plain text content to Tiptap JSON document structure
 * This handles migration of existing blog posts that were stored as plain text
 */

interface Heading {
    level: number
    text: string
  }
  
  interface ListItem {
    type: 'bullet' | 'ordered'
    text: string
  }
  
  /**
   * Check if a string looks like a heading
   */
  const detectHeading = (line: string): Heading | null => {
    const trimmed = line.trim()
    
    // Check for markdown-style headings
    if (trimmed.startsWith("### ")) {
      return { level: 3, text: trimmed.slice(4) }
    }
    if (trimmed.startsWith("## ")) {
      return { level: 2, text: trimmed.slice(3) }
    }
    if (trimmed.startsWith("# ")) {
      return { level: 1, text: trimmed.slice(2) }
    }
    
    // Check for short, capitalized lines (likely headings)
    if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /^[A-Z\s\d]+$/.test(trimmed)) {
      return { level: 2, text: trimmed }
    }
    
    return null
  }
  
  /**
   * Check if a line is a list item
   */
  const detectListItem = (line: string): ListItem | null => {
    const trimmed = line.trim()
    
    // Bullet list (-, *, •)
    if (/^[-*•]\s+/.test(trimmed)) {
      return { type: "bullet", text: trimmed.replace(/^[-*•]\s+/, "") }
    }
    
    // Ordered list (1., 2., etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      return { type: "ordered", text: trimmed.replace(/^\d+\.\s+/, "") }
    }
    
    return null
  }
  
  /**
   * Check if a line is a blockquote
   */
  const detectBlockquote = (line: string): string | null => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith("> ")) {
      return trimmed.slice(2)
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1)
    }
    
    return null
  }
  
  /**
   * Parse inline formatting and create text nodes with marks
   */
  const parseInlineFormatting = (text: string): any[] => {
    if (!text || text.trim() === "") {
      return []
    }
    
    // For simple migration, just return plain text
    return [{ type: "text", text }]
  }
  
  /**
   * Create a paragraph node
   */
  const createParagraph = (text: string) => ({
    type: "paragraph",
    content: parseInlineFormatting(text),
  })
  
  /**
   * Create a heading node
   */
  const createHeading = (text: string, level: number) => ({
    type: "heading",
    attrs: { level },
    content: parseInlineFormatting(text),
  })
  
  /**
   * Create a blockquote node
   */
  const createBlockquote = (text: string) => ({
    type: "blockquote",
    content: [createParagraph(text)],
  })
  
  /**
   * Create a bullet list node
   */
  const createBulletList = (items: string[]) => ({
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [createParagraph(item)],
    })),
  })
  
  /**
   * Create an ordered list node
   */
  const createOrderedList = (items: string[]) => ({
    type: "orderedList",
    content: items.map((item) => ({
      type: "listItem",
      content: [createParagraph(item)],
    })),
  })
  
  /**
   * Check if content is already in Tiptap JSON format
   */
  export const isTiptapJSON = (content: any): boolean => {
    if (!content) return false
    
    // If it's a string, try to parse it
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content)
        return parsed && parsed.type === "doc" && Array.isArray(parsed.content)
      } catch {
        return false
      }
    }
    
    // If it's already an object, check structure
    return content && content.type === "doc" && Array.isArray(content.content)
  }
  
  /**
   * Convert plain text to Tiptap JSON document
   */
  export const migratePlainTextToBlocks = (plainText: string): any => {
    if (!plainText || typeof plainText !== "string") {
      return {
        type: "doc",
        content: [{ type: "paragraph" }],
      }
    }
  
    // Check if already JSON
    if (isTiptapJSON(plainText)) {
      try {
        return JSON.parse(plainText)
      } catch {
        // Continue with plain text migration
      }
    }
  
    const content: any[] = []
    const lines = plainText.split("\n")
    let currentListType: 'bullet' | 'ordered' | null = null
    let currentListItems: string[] = []
  
    const flushList = () => {
      if (currentListItems.length > 0) {
        if (currentListType === "bullet") {
          content.push(createBulletList(currentListItems))
        } else if (currentListType === "ordered") {
          content.push(createOrderedList(currentListItems))
        }
        currentListItems = []
        currentListType = null
      }
    }
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
  
      // Skip empty lines but flush any pending list
      if (trimmedLine === "") {
        flushList()
        continue
      }
  
      // Check for heading
      const heading = detectHeading(line)
      if (heading) {
        flushList()
        content.push(createHeading(heading.text, heading.level))
        continue
      }
  
      // Check for blockquote
      const quote = detectBlockquote(line)
      if (quote) {
        flushList()
        content.push(createBlockquote(quote))
        continue
      }
  
      // Check for list item
      const listItem = detectListItem(line)
      if (listItem) {
        if (currentListType && currentListType !== listItem.type) {
          flushList()
        }
        currentListType = listItem.type
        currentListItems.push(listItem.text)
        continue
      }
  
      // Regular paragraph
      flushList()
      content.push(createParagraph(trimmedLine))
    }
  
    // Flush any remaining list
    flushList()
  
    // Ensure at least one paragraph
    if (content.length === 0) {
      content.push({ type: "paragraph" })
    }
  
    return {
      type: "doc",
      content,
    }
  }
  
  /**
   * Convert Tiptap JSON back to plain text (for excerpt generation, etc.)
   */
  export const blocksToPlainText = (json: any): string => {
    if (!json || !json.content) return ""
  
    const extractText = (node: any): string => {
      if (!node) return ""
      
      if (node.type === "text") {
        return node.text || ""
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join("")
      }
      
      return ""
    }
  
    const processNode = (node: any): string => {
      switch (node.type) {
        case "heading":
          return extractText(node) + "\n\n"
        case "paragraph":
          return extractText(node) + "\n\n"
        case "blockquote":
          return "> " + extractText(node) + "\n\n"
        case "bulletList":
        case "orderedList":
          return node.content
            .map((item: any, index: number) => {
              const prefix = node.type === "orderedList" ? `${index + 1}. ` : "- "
              return prefix + extractText(item)
            })
            .join("\n") + "\n\n"
        case "codeBlock":
          return "```\n" + extractText(node) + "\n```\n\n"
        case "horizontalRule":
          return "---\n\n"
        default:
          return extractText(node)
      }
    }
  
    return json.content
      .map(processNode)
      .join("")
      .trim()
  }
  
  /**
   * Generate excerpt from Tiptap JSON
   */
  export const generateExcerpt = (json: any, maxLength = 150): string => {
    const plainText = blocksToPlainText(json)
    if (plainText.length <= maxLength) {
      return plainText
    }
    return plainText.substring(0, maxLength).trim() + "..."
  }
  
  export default {
    migratePlainTextToBlocks,
    blocksToPlainText,
    generateExcerpt,
    isTiptapJSON,
  }