/**
 * 사용자 관련 Mock 데이터
 */

export interface MockUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  preferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
  };
}

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john.doe@example.com',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    lastLoginAt: '2024-08-04T08:15:00Z',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: true,
    },
    profile: {
      bio: 'Fashion enthusiast and tech lover',
      location: 'Seoul, South Korea',
      website: 'https://johndoe.com',
      socialLinks: {
        twitter: '@johndoe',
        instagram: '@johndoe_style',
      },
    },
  },
  {
    id: '2',
    username: 'janesmit',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b4d4c3d1?w=150',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-10T14:22:00Z',
    lastLoginAt: '2024-08-04T09:45:00Z',
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: true,
    },
    profile: {
      bio: 'E-commerce platform administrator',
      location: 'Busan, South Korea',
    },
  },
  {
    id: '3',
    username: 'mikejohnson',
    email: 'mike.johnson@example.com',
    name: 'Mike Johnson',
    role: 'user',
    isActive: true,
    createdAt: '2024-02-20T16:45:00Z',
    lastLoginAt: '2024-08-03T20:30:00Z',
    preferences: {
      language: 'ko',
      currency: 'KRW',
      notifications: false,
    },
    profile: {
      bio: 'Casual shopper',
      location: 'Incheon, South Korea',
    },
  },
];

export const MOCK_CURRENT_USER: MockUser = MOCK_USERS[0]!;

// 사용자 유틸리티 함수들
export const getUserById = (id: string): MockUser | undefined => {
  return MOCK_USERS.find((user) => user.id === id);
};

export const getUserByUsername = (username: string): MockUser | undefined => {
  return MOCK_USERS.find((user) => user.username === username);
};

export const getUserByEmail = (email: string): MockUser | undefined => {
  return MOCK_USERS.find((user) => user.email === email);
};

export const getActiveUsers = (): MockUser[] => {
  return MOCK_USERS.filter((user) => user.isActive);
};

export const getAdminUsers = (): MockUser[] => {
  return MOCK_USERS.filter((user) => user.role === 'admin');
};

export const isUserActive = (userId: string): boolean => {
  const user = getUserById(userId);
  return user?.isActive || false;
};

export const isUserAdmin = (userId: string): boolean => {
  const user = getUserById(userId);
  return user?.role === 'admin';
};