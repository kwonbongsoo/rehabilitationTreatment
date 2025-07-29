import UIComponentRenderer from '@/components/common/UIComponentRenderer';
import styles from '@/styles/home/HomePage.module.css';
import { UIComponent } from '@/components/common/types/ui-components';
import { getHomeDataAction } from '@/domains/home/services';

// 쿠키 사용으로 인해 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getHomeDataAction();
  if (!data.success) {
    return (
      <div className={styles.homeContainer}>
        <main className={styles.main}>
          <div className={styles.errorMessage}>{data.error}</div>
        </main>
      </div>
    );
  }

  const homeData = data.data!;

  return (
    <div className={styles.homeContainer}>
      <main className={styles.main}>
        <h1 className={styles.srOnly}>SHOP - 온라인 쇼핑몰</h1>
        <div className={styles.content}>
          {homeData?.components?.map((component: UIComponent, index: number) => (
            <UIComponentRenderer key={component.id} component={component} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
