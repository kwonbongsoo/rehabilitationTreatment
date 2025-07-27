import React from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import SectionTitle from '@/components/common/SectionTitle';
// import styles from '@/styles/home/Brands.module.css';

interface BrandsProps {
  title?: string;
  logos: {
    id: number;
    name: string;
    image?: string;
  }[];
}

export default function Brands({ title, logos }: BrandsProps) {
  return (
    <section style={{ padding: '40px 20px', background: 'white' }}>
      {title && <SectionTitle title={title} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {logos.map((logo) => (
          <div key={logo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            {logo.image ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <OptimizedImage
                  src={logo.image}
                  alt={logo.name}
                  width={120}
                  height={80}
                  lazy={true}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', padding: '20px' }}>{logo.name}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
