import { create } from 'zustand';
import { Order, OrderFilter, OrderListItem } from '../types/order';

interface OrderState {
  orders: OrderListItem[];
  selectedOrder: Order | null;
  filter: OrderFilter;
  loading: boolean;
  error: string | null;

  // Actions
  setOrders: (orders: OrderListItem[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setFilter: (filter: OrderFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getFilteredOrders: () => OrderListItem[];
  getOrderById: (id: string) => OrderListItem | undefined;
  getTotalOrderAmount: () => number;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  selectedOrder: null,
  filter: {},
  loading: false,
  error: null,

  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getFilteredOrders: () => {
    const { orders, filter } = get();
    let filtered = [...orders];

    if (filter.status) {
      filtered = filtered.filter((order) => order.status === filter.status);
    }

    if (filter.startDate) {
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= new Date(filter.startDate!),
      );
    }

    if (filter.endDate) {
      filtered = filtered.filter((order) => new Date(order.createdAt) <= new Date(filter.endDate!));
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.order === 'desc' ? -1 : 1;
        switch (filter.sortBy) {
          case 'date':
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
          case 'amount':
            return (a.totalAmount - b.totalAmount) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  },

  getOrderById: (id) => {
    return get().orders.find((order) => order.id === id);
  },

  getTotalOrderAmount: () => {
    return get().orders.reduce((total, order) => total + order.totalAmount, 0);
  },
}));
