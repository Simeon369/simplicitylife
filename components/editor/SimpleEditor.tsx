"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

interface SimpleEditorProps {
  placeholder?: string;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  placeholder = "Write your post...",
}) => {
  const { body, setBody, setAutoSaveStatus } = useEditorStore();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: false,
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: body ?? undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[300px] focus:outline-none bg-white",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setBody(json);
      setAutoSaveStatus("saving");
      setTimeout(() => setAutoSaveStatus("saved"), 300);
    },
  });

  useEffect(() => {
    if (editor && body && editor.isEditable) {
      editor.commands.setContent(body);
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[300px] flex items-center justify-center border border-gray-200 rounded-lg">
        <span className="text-gray-400">Loading editor...</span>
      </div>
    );
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/images", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.url as string;
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error(err);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded ${editor.isActive("bold") ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded ${editor.isActive("italic") ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-1.5 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-1.5 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded ${editor.isActive("bulletList") ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded ${editor.isActive("orderedList") ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <span className="w-px h-5 bg-gray-200" />
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded ${editor.isActive("link") ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <label className="inline-flex items-center gap-1 p-1.5 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
          <ImageIcon className="w-4 h-4" />
          <span className="text-xs">Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />
        </label>
      </div>
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default SimpleEditor;
