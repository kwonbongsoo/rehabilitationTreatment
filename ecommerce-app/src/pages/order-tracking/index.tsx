import React from 'react';

const OrderTrackingPage: React.FC = () => {
    return (
        <>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <h1>주문 조회</h1>

                <div style={{ marginBottom: '2rem' }}>
                    <h2>주문번호로 조회</h2>
                    <input
                        type="text"
                        placeholder="주문번호를 입력하세요"
                        style={{
                            width: '300px',
                            padding: '0.5rem',
                            marginRight: '1rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    <button style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        조회
                    </button>
                </div>

                <h2>배송 상태</h2>
                <ul>
                    <li>주문 접수: 주문이 정상적으로 접수되었습니다</li>
                    <li>상품 준비중: 상품을 포장하고 있습니다</li>
                    <li>배송 시작: 상품이 발송되었습니다</li>
                    <li>배송 완료: 상품이 배송 완료되었습니다</li>
                </ul>
            </div>
        </>
    );
};

export default OrderTrackingPage;

