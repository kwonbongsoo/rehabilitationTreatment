import { useEffect, useRef } from 'react';

/**
 * 🐛 디버깅용 렌더링 로거
 *
 * 이 훅은 일시적인 디버깅 목적으로만 사용하세요.
 * 프로덕션 환경에서는 반드시 제거해야 합니다!
 *
 * 사용법:
 * - useSimpleRenderLogger('컴포넌트명') : 기본 렌더링 로그
 * - useRenderLogger('컴포넌트명', props) : props 변경 추적 포함
 *
 * 현재 적용된 컴포넌트:
 * - Layout
 * - Header
 * - MainNavigation
 * - UserActions
 * - SearchBar
 * - AnnouncementBar
 * - MainLogo
 * - SubNavigation
 * - LoginPageContent
 */

/**
 * 컴포넌트 재렌더링을 추적하는 디버깅용 훅
 * @param componentName - 컴포넌트 이름
 * @param props - 추적할 props (선택사항)
 */
export const useRenderLogger = (componentName: string, props?: Record<string, any>) => {
  const renderCount = useRef(0);
  const prevProps = useRef(props);

  renderCount.current += 1;

  useEffect(() => {
    console.warn(`🔄 [${componentName}] 렌더링 #${renderCount.current}`);

    if (props) {
      console.warn(`📊 [${componentName}] Props:`, props);

      // Props 변경 감지
      if (prevProps.current) {
        const changedProps = Object.keys(props).filter(
          (key) => props[key] !== prevProps.current?.[key],
        );

        if (changedProps.length > 0) {
          console.warn(
            `🔄 [${componentName}] 변경된 Props:`,
            changedProps.reduce(
              (acc, key) => {
                acc[key] = {
                  이전: prevProps.current?.[key],
                  현재: props[key],
                };
                return acc;
              },
              {} as Record<string, any>,
            ),
          );
        }
      }
    }

    prevProps.current = props;
  });

  // 컴포넌트 마운트/언마운트 추적
  useEffect(() => {
    console.warn(`🟢 [${componentName}] 마운트됨`);

    return () => {
      console.warn(`🔴 [${componentName}] 언마운트됨`);
    };
  }, [componentName]);

  return renderCount.current;
};

/**
 * 간단한 렌더링 로거 (컴포넌트 이름만)
 */
export const useSimpleRenderLogger = (componentName: string) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  console.warn(`🔄 ${componentName} - 렌더링 #${renderCount.current}`);

  return renderCount.current;
};

/**
 * 🔬 고급 렌더링 분석 훅 - 렌더링 이유 추적
 */
export const useAdvancedRenderLogger = (
  componentName: string,
  dependencies: Record<string, any>,
) => {
  const renderCount = useRef(0);
  const prevDeps = useRef(dependencies);
  const firstRender = useRef(true);

  renderCount.current += 1;

  // 렌더링 이유 분석
  let renderReason = '';

  if (firstRender.current) {
    renderReason = '초기 렌더링';
    firstRender.current = false;
  } else if (prevDeps.current) {
    const changedDeps = Object.keys(dependencies).filter(
      (key) => dependencies[key] !== prevDeps.current?.[key],
    );

    if (changedDeps.length > 0) {
      renderReason = `의존성 변경: ${changedDeps.join(', ')}`;
    } else {
      renderReason = '알 수 없는 이유 (부모 렌더링?)';
    }
  }

  console.warn(`🔬 [${componentName}] 렌더링 #${renderCount.current} - ${renderReason}`);

  if (dependencies && Object.keys(dependencies).length > 0) {
    console.warn(`📋 [${componentName}] 의존성:`, dependencies);

    if (prevDeps.current && renderReason.includes('의존성 변경')) {
      const changedDeps = Object.keys(dependencies).filter(
        (key) => dependencies[key] !== prevDeps.current?.[key],
      );

      console.warn(
        `⚡ [${componentName}] 변경된 의존성:`,
        changedDeps.reduce(
          (acc, key) => {
            acc[key] = {
              이전: prevDeps.current?.[key],
              현재: dependencies[key],
            };
            return acc;
          },
          {} as Record<string, any>,
        ),
      );
    }
  }

  prevDeps.current = { ...dependencies };

  return renderCount.current;
};

/**
 * 모든 렌더링 로거를 한 번에 제거하는 헬퍼 함수
 * (실제로는 각 컴포넌트에서 개별적으로 제거해야 함)
 */
export const RENDER_LOGGER_REMOVAL_GUIDE = `
디버깅이 끝나면 다음 컴포넌트들에서 렌더링 로거를 제거하세요:

1. Layout.tsx - useSimpleRenderLogger('Layout')
2. Header/index.tsx - useRenderLogger('Header', { isMenuOpen })
3. Header/MainNavigation.tsx - useRenderLogger('MainNavigation', { isOpen, pathname })
4. Header/UserActions.tsx - useRenderLogger('UserActions', { ... })
5. Header/SearchBar.tsx - useRenderLogger('SearchBar', { isSearchOpen })
6. Header/AnnouncementBar.tsx - useSimpleRenderLogger('AnnouncementBar')
7. Header/MainLogo.tsx - useSimpleRenderLogger('MainLogo')
8. Header/SubNavigation.tsx - useRenderLogger('SubNavigation', { visible })
9. auth/LoginPageContent.tsx - useRenderLogger('LoginPageContent', { ... })

그리고 이 파일(useRenderLogger.ts)도 삭제하세요!
`;
