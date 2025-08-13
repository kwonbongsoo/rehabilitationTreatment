'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  ReactElement,
} from 'react';
import { createUIConfigurationService, UIConfiguration } from '@/services/uiConfigurationService';

const UIConfigContext = createContext<UIConfiguration | null>(null);

interface UIConfigProviderProps {
  children: ReactNode;
}

/**
 * UI 설정 Context Provider
 *
 * 메모리 릭 방지를 위해 전역변수 대신 React Context 패턴 사용:
 * - useState로 안전한 초기화 (함수형 초기 상태)
 * - Provider 언마운트 시 자동 cleanup
 * - React 생명주기에 따른 안전한 메모리 관리
 */
export function UIConfigProvider({ children }: UIConfigProviderProps): ReactElement {
  // useState는 초기화를 한 번만 실행 (함수형 초기 상태)
  const [config] = useState(() => {
    const service = createUIConfigurationService();
    return service.createConfiguration();
  });

  // Provider 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      // QueryClient 캐시 정리
      config.queryClient.clear();

      // 추가적인 cleanup 로직이 필요한 경우 여기에 추가
    };
  }, [config]);

  return <UIConfigContext.Provider value={config}>{children}</UIConfigContext.Provider>;
}

/**
 * UI 설정 사용 훅
 *
 * @throws {Error} UIConfigProvider 외부에서 사용할 경우 에러 발생
 * @returns UIConfiguration 객체
 */
export const useUIConfig = (): UIConfiguration => {
  const context = useContext(UIConfigContext);

  if (!context) {
    throw new Error('useUIConfig must be used within UIConfigProvider');
  }

  return context;
};

export { UIConfigContext };
