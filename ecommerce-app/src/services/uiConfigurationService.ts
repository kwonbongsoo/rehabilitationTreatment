import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ToastContainerProps } from 'react-toastify';

// 도메인 타입 정의
export interface QueryClientConfig {
  defaultOptions?: {
    queries?: {
      staleTime?: number;
      cacheTime?: number;
      retry?: boolean | number | ((failureCount: number, error: any) => boolean);
      refetchOnWindowFocus?: boolean;
      refetchOnReconnect?: boolean;
      refetchOnMount?: boolean;
    };
    mutations?: {
      retry?: boolean | number | ((failureCount: number, error: any) => boolean);
      onError?: (error: any) => void;
    };
  };
}

export interface ToastConfig
  extends Omit<Partial<ToastContainerProps>, 'position' | 'autoClose' | 'hideProgressBar'> {
  position: ToastContainerProps['position'];
  autoClose: number;
  hideProgressBar: boolean;
}

export interface DevtoolsConfig {
  enabled: boolean;
  initialIsOpen: boolean;
}

export interface UIConfiguration {
  queryClient: QueryClient;
  toastConfig: ToastConfig;
  devtoolsConfig: DevtoolsConfig;
}

// 설정 인터페이스들
interface IQueryClientFactory {
  createQueryClient(config?: QueryClientConfig): QueryClient;
}

interface IToastConfigProvider {
  getToastConfig(): ToastConfig;
}

interface IDevtoolsConfigProvider {
  getDevtoolsConfig(): DevtoolsConfig;
}

// React Query 클라이언트 팩토리 (단일 책임 원칙)
class QueryClientFactory implements IQueryClientFactory {
  private static readonly DEFAULT_CONFIG: QueryClientConfig = {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5분
        cacheTime: 10 * 60 * 1000, // 10분 (React Query v5에서는 gcTime)
        retry: (failureCount: number, error: any) => {
          // 인증 에러는 재시도하지 않음
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // 서버 에러는 최대 2번까지 재시도
          if (error?.status >= 500) {
            return failureCount < 2;
          }
          // 기타 에러는 재시도하지 않음
          return false;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: (failureCount: number, error: any) => {
          // Mutation은 기본적으로 재시도하지 않음
          // 단, 네트워크 에러의 경우 1번 재시도
          if (error?.code === 'NETWORK_ERROR') {
            return failureCount < 1;
          }
          return false;
        },
        onError: (error: any) => {
          console.error('Mutation error:', error);
          // 전역 에러 처리 로직 추가 가능
          if (error?.status === 401) {
            // 인증 실패 시 로그아웃 처리
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }
        },
      },
    },
  };

  createQueryClient(config: QueryClientConfig = {}): QueryClient {
    const mergedConfig = this.mergeConfig(QueryClientFactory.DEFAULT_CONFIG, config);

    return new QueryClient({
      ...mergedConfig,
      queryCache: new QueryCache({
        onError: (error: any, query) => {
          console.error('Query error:', error, 'Query key:', query.queryKey);
          // 전역 쿼리 에러 처리
          if (error?.status === 401) {
            // 인증 실패 시 처리
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error: any) => {
          console.error('Global mutation error:', error);
        },
      }),
    });
  }

  private mergeConfig(
    defaultConfig: QueryClientConfig,
    userConfig: QueryClientConfig,
  ): QueryClientConfig {
    return {
      defaultOptions: {
        queries: {
          ...defaultConfig.defaultOptions?.queries,
          ...userConfig.defaultOptions?.queries,
        },
        mutations: {
          ...defaultConfig.defaultOptions?.mutations,
          ...userConfig.defaultOptions?.mutations,
        },
      },
    };
  }
}

// 토스트 설정 제공자 (단일 책임 원칙)
class ToastConfigProvider implements IToastConfigProvider {
  private static readonly DEFAULT_TOAST_CONFIG: ToastConfig = {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
  };

  getToastConfig(): ToastConfig {
    return { ...ToastConfigProvider.DEFAULT_TOAST_CONFIG };
  }
}

// 개발 도구 설정 제공자 (단일 책임 원칙)
class DevtoolsConfigProvider implements IDevtoolsConfigProvider {
  getDevtoolsConfig(): DevtoolsConfig {
    return {
      enabled: false, // devtools 완전 비활성화
      initialIsOpen: false,
    };
  }
}

// UI 설정 서비스 (조합 패턴)
export class UIConfigurationService {
  constructor(
    private queryClientFactory: IQueryClientFactory,
    private toastConfigProvider: IToastConfigProvider,
    private devtoolsConfigProvider: IDevtoolsConfigProvider,
  ) {}

  createConfiguration(queryClientConfig?: QueryClientConfig): UIConfiguration {
    return {
      queryClient: this.queryClientFactory.createQueryClient(queryClientConfig),
      toastConfig: this.toastConfigProvider.getToastConfig(),
      devtoolsConfig: this.devtoolsConfigProvider.getDevtoolsConfig(),
    };
  }

  // 기존 QueryClient를 재설정하는 메서드
  reconfigureQueryClient(currentClient: QueryClient, newConfig: QueryClientConfig): QueryClient {
    // 기존 클라이언트를 정리하고 새로운 클라이언트 생성
    currentClient.clear();
    return this.queryClientFactory.createQueryClient(newConfig);
  }
}

// 팩토리 함수 (의존성 주입 컨테이너 역할)
export const createUIConfigurationService = (): UIConfigurationService => {
  const queryClientFactory = new QueryClientFactory();
  const toastConfigProvider = new ToastConfigProvider();
  const devtoolsConfigProvider = new DevtoolsConfigProvider();

  return new UIConfigurationService(
    queryClientFactory,
    toastConfigProvider,
    devtoolsConfigProvider,
  );
};
