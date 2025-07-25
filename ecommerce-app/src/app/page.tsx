'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UIComponentRenderer from '@/components/home/UIComponentRenderer';
import HomeSkeleton from '@/components/skeleton/HomeSkeleton';
import styles from '@/styles/home/HomePage.module.css';
import { HomePageResponse, UIComponent } from '@/types/home';
import { getHomeDataAction } from './actions/home';

export default function HomePage() {
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomePageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getHomeDataAction();
        if (!data.success) {
          throw new Error(data.error!);
        }

        setHomeData(data.data!);
      } catch (err) {
        console.error('Error loading home data:', err);
        const errorMessage =
          err instanceof Error ? err.message : '페이지를 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleFilterClick = () => {
    router.push('/filter');
  };

  if (isLoading) {
    return (
      <div className={styles.homeContainer}>
        <HomeSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homeContainer}>
        <main className={styles.main}>
          <div className={styles.errorMessage}>{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <main className={styles.main}>
        <div className={styles.content}>
          {homeData?.components?.map((component: UIComponent, index: number) => (
            <UIComponentRenderer key={component.id} component={component} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
