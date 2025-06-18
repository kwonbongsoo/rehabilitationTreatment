const StoresPage: React.FC = () => {
  return (
    <>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1>매장 안내</h1>

        <section style={{ marginBottom: '2rem' }}>
          <h2>오프라인 매장</h2>
          <p>온라인뿐만 아니라 오프라인 매장에서도 다양한 상품을 만나보실 수 있습니다.</p>
        </section>

        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
            <h3>강남점</h3>
            <p>
              <strong>주소:</strong> 서울특별시 강남구 테헤란로 123
            </p>
            <p>
              <strong>전화:</strong> 02-1234-5678
            </p>
            <p>
              <strong>운영시간:</strong> 평일 10:00 - 22:00, 주말 10:00 - 21:00
            </p>
            <p>
              <strong>특징:</strong> 플래그십 스토어, 모든 상품 라인 진열
            </p>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
            <h3>홍대점</h3>
            <p>
              <strong>주소:</strong> 서울특별시 마포구 와우산로 456
            </p>
            <p>
              <strong>전화:</strong> 02-2345-6789
            </p>
            <p>
              <strong>운영시간:</strong> 매일 11:00 - 23:00
            </p>
            <p>
              <strong>특징:</strong> 트렌디한 의류 중심, 젊은 고객층 타겟
            </p>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
            <h3>부산센텀점</h3>
            <p>
              <strong>주소:</strong> 부산광역시 해운대구 센텀중앙로 789
            </p>
            <p>
              <strong>전화:</strong> 051-3456-7890
            </p>
            <p>
              <strong>운영시간:</strong> 평일 10:00 - 21:00, 주말 10:00 - 22:00
            </p>
            <p>
              <strong>특징:</strong> 대형 매장, 가족형 고객 중심
            </p>
          </div>
        </div>

        <section style={{ marginTop: '2rem' }}>
          <h2>매장 서비스</h2>
          <ul>
            <li>온라인 주문 매장 픽업 서비스</li>
            <li>무료 사이즈 교환 (30일 이내)</li>
            <li>개인 스타일링 상담 서비스</li>
            <li>VIP 고객 전용 라운지</li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default StoresPage;
