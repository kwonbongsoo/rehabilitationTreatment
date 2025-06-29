'use client';

import UIComponentRenderer from '@/components/home/UIComponentRenderer';
import HomeSkeleton from '@/components/skeleton/HomeSkeleton';
import styles from '@/styles/common/Layout.module.css';
import { HomePageResponse, UIComponent } from '@/types/home';
import { useEffect, useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { mockHomePageData } from '@/mocks/homePageData';

export default function HomePage() {
  // 커스텀 에러 핸들러 훅 사용
  const { handleError } = useErrorHandler();

  // 목 데이터 직접 사용하기 (API 호출 없이)
  const [homeData, setHomeData] = useState<HomePageResponse | null>(null);
  const [isHomeDataLoading, setIsHomeDataLoading] = useState(true);
  const [homeDataError, setHomeDataError] = useState<Error | null>(null);

  // 목 데이터 로딩 시뮬레이션
  useEffect(() => {
    const loadMockData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setHomeData(mockHomePageData);
        setIsHomeDataLoading(false);
      } catch (error) {
        console.error('Error loading mock data:', error);
        setHomeDataError(error as Error);
        setIsHomeDataLoading(false);
      }
    };

    loadMockData();
  }, []);

  // 홈 데이터 에러 처리
  useEffect(() => {
    if (homeDataError) {
      // React Error #185 방지를 위해 다음 틱에서 실행
      setTimeout(() => {
        handleError(homeDataError);
      }, 0);
    }
  }, [homeDataError, handleError]);

  return (
    <main className={styles.main}>
      {isHomeDataLoading ? (
        <HomeSkeleton />
      ) : homeData?.components ? (
        homeData.components.map((component: UIComponent) => (
          <UIComponentRenderer key={component.id} component={component} />
        ))
      ) : (
        <div>페이지를 불러오는 데 문제가 발생했습니다.</div>
      )}
    </main>
  );
}
