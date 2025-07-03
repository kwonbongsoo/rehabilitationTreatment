import { create } from 'zustand';
import { Promotion, PromotionFilter, PromotionListItem } from '../types/promotion';

interface PromotionState {
  promotions: PromotionListItem[];
  selectedPromotion: Promotion | null;
  filter: PromotionFilter;
  loading: boolean;
  error: string | null;

  // Actions
  setPromotions: (promotions: PromotionListItem[]) => void;
  setSelectedPromotion: (promotion: Promotion | null) => void;
  setFilter: (filter: PromotionFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getFilteredPromotions: () => PromotionListItem[];
  getPromotionById: (id: string) => PromotionListItem | undefined;
  getActivePromotions: () => PromotionListItem[];
}

export const usePromotionStore = create<PromotionState>()((set, get) => ({
  promotions: [],
  selectedPromotion: null,
  filter: {},
  loading: false,
  error: null,

  setPromotions: (promotions) => set({ promotions }),
  setSelectedPromotion: (promotion) => set({ selectedPromotion: promotion }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getFilteredPromotions: () => {
    const { promotions, filter } = get();
    let filtered = [...promotions];

    if (filter.type) {
      filtered = filtered.filter((promotion) => promotion.type === filter.type);
    }

    if (filter.active !== undefined) {
      filtered = filtered.filter((promotion) => promotion.active === filter.active);
    }

    if (filter.startDate) {
      filtered = filtered.filter(
        (promotion) => new Date(promotion.startDate) >= new Date(filter.startDate!),
      );
    }

    if (filter.endDate) {
      filtered = filtered.filter(
        (promotion) => new Date(promotion.endDate) <= new Date(filter.endDate!),
      );
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.order === 'desc' ? -1 : 1;
        switch (filter.sortBy) {
          case 'startDate':
            return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * order;
          case 'endDate':
            return (new Date(a.endDate).getTime() - new Date(b.endDate).getTime()) * order;
          case 'name':
            return a.name.localeCompare(b.name) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  },

  getPromotionById: (id) => {
    return get().promotions.find((promotion) => promotion.id === id);
  },

  getActivePromotions: () => {
    const now = new Date();
    return get().promotions.filter(
      (promotion) =>
        promotion.active &&
        new Date(promotion.startDate) <= now &&
        new Date(promotion.endDate) >= now,
    );
  },
}));
