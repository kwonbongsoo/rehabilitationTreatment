import styles from '@/styles/common/SectionTitle.module.css'; // 경로 변경

interface SectionTitleProps {
    title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
    return <h2 className={styles.sectionTitle}>{title}</h2>;
}