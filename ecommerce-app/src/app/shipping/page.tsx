'use client';

export default function Shipping() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>
          Shipping Info
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
          Fast and secure delivery service
        </p>
      </div>
      
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
          Delivery Options
        </h2>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          Free shipping on orders over $50. Standard delivery takes 2-3 business days.
        </p>
      </div>
    </div>
  );
}