"use client";

import { create } from "zustand";

export interface BlogUiState {
  currentTag: string | null;
  searchQuery: string;
  page: number;
  sort: string;
  setCurrentTag: (tag: string | null) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  setSort: (sort: string) => void;
  reset: () => void;
}

const initialState = {
  currentTag: null as string | null,
  searchQuery: "",
  page: 1,
  sort: "newest",
};

export const useBlogUiStore = create<BlogUiState>((set) => ({
  ...initialState,

  setCurrentTag: (currentTag) => set({ currentTag, page: 1 }),

  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),

  setPage: (page) => set({ page }),

  setSort: (sort) => set({ sort, page: 1 }),

  reset: () => set(initialState),
}));
