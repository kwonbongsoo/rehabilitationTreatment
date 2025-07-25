import { NavItem } from './types';
import { HomeIcon, CartIcon, OrdersIcon, ProfileIcon } from './icons';

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: HomeIcon,
  },
  {
    id: 'cart',
    label: 'Cart',
    path: '/cart',
    icon: CartIcon,
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/account/orders',
    icon: OrdersIcon,
    requiresAuth: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/account',
    icon: ProfileIcon,
    requiresAuth: true,
  },
];
