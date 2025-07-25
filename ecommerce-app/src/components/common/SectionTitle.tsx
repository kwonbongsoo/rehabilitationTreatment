// import styles from '@/styles/common/SectionTitle.module.css'; // 경로 변경

interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
  return <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px', textAlign: 'center' }}>{title}</h2>;
}
