"use client";

import { create } from "zustand";
import type { Tag } from "@/types";

export type EditorStatus = "draft" | "published";

export interface EditorState {
  title: string;
  body: any;
  tags: Tag[];
  headerImageFile: File | null;
  headerImagePreview: string | null;
  status: EditorStatus;
  autoSaveStatus: "idle" | "saving" | "saved";
  setTitle: (title: string) => void;
  setBody: (body: any) => void;
  setTags: (tags: Tag[]) => void;
  setHeaderImageFile: (file: File | null, preview?: string | null) => void;
  setStatus: (status: EditorStatus) => void;
  setAutoSaveStatus: (status: "idle" | "saving" | "saved") => void;
  reset: () => void;
}

const initialState = {
  title: "",
  body: null,
  tags: [] as Tag[],
  headerImageFile: null as File | null,
  headerImagePreview: null as string | null,
  status: "draft" as EditorStatus,
  autoSaveStatus: "idle" as const,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setTitle: (title) => set({ title }),

  setBody: (body) => set({ body }),

  setTags: (tags) => set({ tags }),

  setHeaderImageFile: (file, preview) =>
    set({
      headerImageFile: file,
      headerImagePreview: preview ?? null,
    }),

  setStatus: (status) => set({ status }),

  setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),

  reset: () => set({ ...initialState }),
}));
