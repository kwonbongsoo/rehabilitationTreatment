import styles from '@/styles/templates/UserFormLayout.module.css';

interface DividerProps {
  text: string;
}

export function Divider({ text }: DividerProps) {
  return (
    <div className={styles.divider}>
      <span className={styles.dividerText}>{text}</span>
    </div>
  );
}
