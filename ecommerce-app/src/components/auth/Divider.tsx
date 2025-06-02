import styles from '@/styles/shared/UserFormLayout.module.css';

interface DividerProps {
    text: string;
}

export default function Divider({ text }: DividerProps) {
    return (
        <div className={styles.divider}>
            <span className={styles.dividerText}>{text}</span>
        </div>
    );
}