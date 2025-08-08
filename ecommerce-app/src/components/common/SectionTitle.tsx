import { ReactElement } from 'react';

interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps): ReactElement {
  return (
    <h2
      style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
      }}
    >
      {title}
    </h2>
  );
}
