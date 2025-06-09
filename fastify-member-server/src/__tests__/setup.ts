import '@jest/globals';

// Jest 전역 타입 선언
declare global {
  namespace jest {
    type CustomMocked<T> = {
      [P in keyof T]: jest.Mock;
    };
  }
}
