import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  requiresAuth?: boolean;
  isActive: boolean;
}

export interface BottomNavigationProps {}
