import UIComponentRenderer from '@/components/common/UIComponentRenderer';
import styles from '@/styles/home/HomePage.module.css';
import { UIComponent } from '@/components/common/types/ui-components';
import homeService from '@/domains/home/services/homeService';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import { ReactElement } from 'react';

// 쿠키 사용으로 인해 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default async function HomePage(): Promise<ReactElement> {
  try {
    // 서버에서 헤더 생성
    const headers = await HeaderBuilderFactory.createForApiRequest().build();

    // 홈서비스 호출
    const { components } = await homeService.getHomePageData({ headers });

    return (
      <div className={styles.homeContainer}>
        <main className={styles.main}>
          <h1 className={styles.srOnly}>SHOP - 온라인 쇼핑몰</h1>
          <div className={styles.content}>
            {components?.map((component: UIComponent, index: number) => (
              <UIComponentRenderer key={component.id} component={component} index={index} />
            ))}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Home page error:', error);
    return (
      <div className={styles.homeContainer}>
        <main className={styles.main}>
          <div className={styles.errorMessage}>페이지를 불러오는 중 오류가 발생했습니다.</div>
        </main>
      </div>
    );
  }
}
