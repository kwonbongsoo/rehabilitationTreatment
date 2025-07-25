'use client';

export default function Returns() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>
          Returns & Exchanges
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
          Safe and convenient return service
        </p>
      </div>
      
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
          Return Policy
        </h2>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          You can return items within 7 days of receipt. Please contact customer service for more information.
        </p>
      </div>
    </div>
  );
}