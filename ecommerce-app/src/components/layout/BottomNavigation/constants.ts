import { NavItem } from './types';
import { HomeIcon, CartIcon, OrdersIcon, ProfileIcon } from './icons';

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: HomeIcon,
    isActive: false,
  },
  {
    id: 'cart',
    label: 'Cart',
    path: '/cart',
    icon: CartIcon,
    isActive: false,
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/account/orders',
    icon: OrdersIcon,
    requiresAuth: true,
    isActive: false,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/account',
    icon: ProfileIcon,
    isActive: false,
    requiresAuth: true,
  },
];
