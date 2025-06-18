import { QueryClient } from '@tanstack/react-query';
import { ToastContainerProps } from 'react-toastify';

// 도메인 타입 정의
export interface QueryClientConfig {
  defaultOptions?: {
    queries?: {
      staleTime?: number;
      cacheTime?: number;
      retry?: number;
      refetchOnWindowFocus?: boolean;
    };
    mutations?: {
      retry?: number;
    };
  };
}

export interface ToastConfig extends Partial<ToastContainerProps> {
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
        cacheTime: 10 * 60 * 1000, // 10분
        retry: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  };

  createQueryClient(config: QueryClientConfig = {}): QueryClient {
    const mergedConfig = this.mergeConfig(QueryClientFactory.DEFAULT_CONFIG, config);
    return new QueryClient(mergedConfig);
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
      enabled: process.env.NODE_ENV === 'development',
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
