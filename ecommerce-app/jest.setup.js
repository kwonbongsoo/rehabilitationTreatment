import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      reload: jest.fn(),
      isReady: true,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn(),
  },
  ToastContainer: ({ children }) => children,
}));

// Zustand stores are mocked in individual test files

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
  },
  writable: true,
});

// Mock console methods in tests
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock CSS modules
jest.mock('*.module.css', () => {
  return new Proxy(
    {},
    {
      get: function getter(target, key) {
        if (key === '__esModule') {
          return false;
        }
        return key;
      },
    },
  );
});

// Mock image imports
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Setup global test utilities
beforeEach(() => {
  jest.clearAllMocks();
});

// Setup proper cleanup
afterEach(() => {
  jest.clearAllMocks();
});
