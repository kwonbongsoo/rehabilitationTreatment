import { createUIConfigurationService } from '../uiConfigurationService';

describe('UIConfigurationService', () => {
  let service: ReturnType<typeof createUIConfigurationService>;

  beforeEach(() => {
    service = createUIConfigurationService();
  });

  describe('createConfiguration', () => {
    it('creates UI configuration with default settings', () => {
      const config = service.createConfiguration();
      
      expect(config).toBeDefined();
      expect(config.queryClient).toBeDefined();
      expect(config.toastConfig).toBeDefined();
      expect(config.devtoolsConfig).toBeDefined();
    });

    it('creates UI configuration with custom settings', () => {
      const customQueryConfig = {
        defaultOptions: {
          queries: {
            staleTime: 10000,
          },
        },
      };

      const config = service.createConfiguration(customQueryConfig);
      
      expect(config).toBeDefined();
      expect(config.queryClient).toBeDefined();
    });
  });

  describe('toast configuration', () => {
    it('provides valid toast configuration', () => {
      const config = service.createConfiguration();
      
      expect(config.toastConfig).toBeDefined();
      expect(config.toastConfig.position).toBeDefined();
      expect(typeof config.toastConfig.autoClose).toBe('number');
      expect(typeof config.toastConfig.hideProgressBar).toBe('boolean');
    });
  });

  describe('devtools configuration', () => {
    it('provides valid devtools configuration', () => {
      const config = service.createConfiguration();
      
      expect(config.devtoolsConfig).toBeDefined();
      expect(typeof config.devtoolsConfig.enabled).toBe('boolean');
      expect(typeof config.devtoolsConfig.initialIsOpen).toBe('boolean');
    });
  });

  describe('query client configuration', () => {
    it('creates query client with default options', () => {
      const config = service.createConfiguration();
      
      expect(config.queryClient).toBeDefined();
      expect(config.queryClient.getQueryCache()).toBeDefined();
      expect(config.queryClient.getMutationCache()).toBeDefined();
    });

    it('applies custom query options when provided', () => {
      const customConfig = {
        defaultOptions: {
          queries: {
            staleTime: 60000,
            retry: false,
          },
        },
      };

      const config = service.createConfiguration(customConfig);
      
      expect(config.queryClient).toBeDefined();
      // Query client should be created with custom options
      expect(config.queryClient.getDefaultOptions().queries?.staleTime).toBe(60000);
    });
  });
});