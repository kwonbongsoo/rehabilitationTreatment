import { create } from 'zustand';
import { Content, ContentFilter, ContentListItem } from '../types/content';

interface ContentState {
  contents: ContentListItem[];
  selectedContent: Content | null;
  filter: ContentFilter;
  loading: boolean;
  error: string | null;

  // Actions
  setContents: (contents: ContentListItem[]) => void;
  setSelectedContent: (content: Content | null) => void;
  setFilter: (filter: ContentFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getFilteredContents: () => ContentListItem[];
  getContentBySlug: (slug: string) => ContentListItem | undefined;
  getContentById: (id: string) => ContentListItem | undefined;
  getPublishedContents: () => ContentListItem[];
}

export const useContentStore = create<ContentState>()((set, get) => ({
  contents: [],
  selectedContent: null,
  filter: {},
  loading: false,
  error: null,

  setContents: (contents) => set({ contents }),
  setSelectedContent: (content) => set({ selectedContent: content }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getFilteredContents: () => {
    const { contents, filter } = get();
    let filtered = [...contents];

    if (filter.type) {
      filtered = filtered.filter((content) => content.type === filter.type);
    }

    if (filter.published !== undefined) {
      filtered = filtered.filter((content) => content.published === filter.published);
    }

    if (filter.startDate) {
      filtered = filtered.filter((content) =>
        content.publishedAt ? new Date(content.publishedAt) >= new Date(filter.startDate!) : false,
      );
    }

    if (filter.endDate) {
      filtered = filtered.filter((content) =>
        content.publishedAt ? new Date(content.publishedAt) <= new Date(filter.endDate!) : false,
      );
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.order === 'desc' ? -1 : 1;
        switch (filter.sortBy) {
          case 'publishedAt':
            return (
              ((a.publishedAt ? new Date(a.publishedAt).getTime() : 0) -
                (b.publishedAt ? new Date(b.publishedAt).getTime() : 0)) *
              order
            );
          case 'title':
            return a.title.localeCompare(b.title) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  },

  getContentBySlug: (slug) => {
    return get().contents.find((content) => content.slug === slug);
  },

  getContentById: (id) => {
    return get().contents.find((content) => content.id === id);
  },

  getPublishedContents: () => {
    return get().contents.filter((content) => content.published);
  },
}));
