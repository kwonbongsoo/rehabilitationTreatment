import UIComponentRenderer from '@/components/home/UIComponentRenderer';
import styles from '@/styles/home/HomePage.module.css';
import { UIComponent } from '@/types/home';
import { getHomeDataAction } from './actions/home';

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
        <div className={styles.content}>
          {homeData?.components?.map((component: UIComponent, index: number) => (
            <UIComponentRenderer key={component.id} component={component} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
