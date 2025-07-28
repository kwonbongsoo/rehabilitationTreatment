import { UIComponentRenderer } from '@/domains/home/components';
import styles from '@/styles/home/HomePage.module.css';
import { UIComponent } from '@/domains/home/types';
import { getHomeDataAction } from '@/domains/home/services';

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
