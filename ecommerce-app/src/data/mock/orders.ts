/**
 * 주문 관련 Mock 데이터
 */

import { MockCartItem } from './cart';

export interface MockOrder {
  id: string;
  orderNumber: string;
  userId: string;
  items: MockCartItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  notes?: string;
  trackingNumber?: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    userId: '1',
    items: [
      {
        id: '1',
        name: 'Classic T-shirt',
        price: 169000,
        quantity: 2,
        image: 'https://static.kbs-cdn.shop/image/promotion.jpg',
        productId: '1',
        options: { size: 'M', color: 'Black' },
      },
      {
        id: '2',
        name: 'Skinny Jeans',
        price: 189000,
        quantity: 1,
        image: 'https://static.kbs-cdn.shop/image/promotion.jpg',
        productId: '2',
        options: { size: 'L', color: 'Blue' },
      },
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 527000,
    shipping: 3000,
    tax: 52700,
    discount: 0,
    total: 582700,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Fashion Street, Apt 4B',
      city: 'Seoul',
      postalCode: '06543',
      country: 'South Korea',
      phone: '+82-10-1234-5678',
    },
    createdAt: '2024-07-15T10:30:00Z',
    updatedAt: '2024-07-20T14:22:00Z',
    deliveredAt: '2024-07-20T14:22:00Z',
    trackingNumber: 'TRK123456789',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    userId: '1',
    items: [
      {
        id: '3',
        name: 'Slip Dresses',
        price: 159000,
        quantity: 1,
        image: 'https://static.kbs-cdn.shop/image/promotion.jpg',
        productId: '3',
        options: { size: 'S', color: 'Navy' },
      },
    ],
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'paypal',
    subtotal: 159000,
    shipping: 3000,
    tax: 15900,
    discount: 15900, // 10% discount
    total: 162000,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Fashion Street, Apt 4B',
      city: 'Seoul',
      postalCode: '06543',
      country: 'South Korea',
      phone: '+82-10-1234-5678',
    },
    createdAt: '2024-08-01T09:15:00Z',
    updatedAt: '2024-08-03T16:30:00Z',
    trackingNumber: 'TRK987654321',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    userId: '3',
    items: [
      {
        id: '1',
        name: 'Classic T-shirt',
        price: 169000,
        quantity: 1,
        image: 'https://static.kbs-cdn.shop/image/promotion.jpg',
        productId: '1',
        options: { size: 'L', color: 'White' },
      },
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    subtotal: 169000,
    shipping: 3000,
    tax: 16900,
    discount: 0,
    total: 188900,
    shippingAddress: {
      name: 'Mike Johnson',
      address: '456 Style Avenue',
      city: 'Incheon',
      postalCode: '21999',
      country: 'South Korea',
      phone: '+82-10-9876-5432',
    },
    createdAt: '2024-08-03T14:20:00Z',
    updatedAt: '2024-08-04T10:15:00Z',
  },
];

// 주문 유틸리티 함수들
export const getOrderById = (id: string): MockOrder | undefined => {
  return MOCK_ORDERS.find((order) => order.id === id);
};

export const getOrdersByUserId = (userId: string): MockOrder[] => {
  return MOCK_ORDERS.filter((order) => order.userId === userId);
};

export const getOrdersByStatus = (status: MockOrder['status']): MockOrder[] => {
  return MOCK_ORDERS.filter((order) => order.status === status);
};

export const getRecentOrders = (limit = 5): MockOrder[] => {
  return MOCK_ORDERS
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const calculateOrderTotal = (
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number
): number => {
  return subtotal + shipping + tax - discount;
};

export const getOrderStatusColor = (status: MockOrder['status']): string => {
  const statusColors = {
    pending: '#ffa500',
    confirmed: '#007bff',
    processing: '#17a2b8',
    shipped: '#6610f2',
    delivered: '#28a745',
    cancelled: '#dc3545',
  };
  
  return statusColors[status] || '#6c757d';
};

export const getPaymentStatusColor = (status: MockOrder['paymentStatus']): string => {
  const statusColors = {
    pending: '#ffa500',
    paid: '#28a745',
    failed: '#dc3545',
    refunded: '#6c757d',
  };
  
  return statusColors[status] || '#6c757d';
};