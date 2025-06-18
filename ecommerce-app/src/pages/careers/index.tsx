const CareersPage: React.FC = () => {
  return (
    <>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1>채용 정보</h1>

        <section style={{ marginBottom: '2rem' }}>
          <h2>함께 성장할 인재를 찾습니다</h2>
          <p>
            우리와 함께 패션 업계의 미래를 만들어갈 열정적인 인재를 찾고 있습니다. 창의적이고
            도전적인 환경에서 자신의 역량을 발휘하고 성장할 수 있는 기회를 제공합니다.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>현재 채용 중인 포지션</h2>

          <div
            style={{
              border: '1px solid #ddd',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '8px',
            }}
          >
            <h3>프론트엔드 개발자</h3>
            <p>
              <strong>부서:</strong> IT개발팀
            </p>
            <p>
              <strong>경력:</strong> 3년 이상
            </p>
            <p>
              <strong>주요 업무:</strong>
            </p>
            <ul>
              <li>React/Next.js 기반 웹 서비스 개발</li>
              <li>사용자 경험 최적화</li>
              <li>반응형 웹 디자인 구현</li>
            </ul>
            <p>
              <strong>우대사항:</strong> TypeScript, 전자상거래 경험
            </p>
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '8px',
            }}
          >
            <h3>패션 MD (머천다이저)</h3>
            <p>
              <strong>부서:</strong> 상품기획팀
            </p>
            <p>
              <strong>경력:</strong> 5년 이상
            </p>
            <p>
              <strong>주요 업무:</strong>
            </p>
            <ul>
              <li>시즌별 상품 기획 및 구매</li>
              <li>트렌드 분석 및 상품 전략 수립</li>
              <li>브랜드와의 협업 및 네고시에이션</li>
            </ul>
            <p>
              <strong>우대사항:</strong> 패션 전공, 해외 바잉 경험
            </p>
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '8px',
            }}
          >
            <h3>디지털 마케팅 매니저</h3>
            <p>
              <strong>부서:</strong> 마케팅팀
            </p>
            <p>
              <strong>경력:</strong> 3년 이상
            </p>
            <p>
              <strong>주요 업무:</strong>
            </p>
            <ul>
              <li>온라인 마케팅 캠페인 기획 및 실행</li>
              <li>SNS 마케팅 및 인플루언서 협업</li>
              <li>데이터 분석을 통한 마케팅 효과 측정</li>
            </ul>
            <p>
              <strong>우대사항:</strong> 구글 애널리틱스, 페이스북 광고 경험
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>복리후생</h2>
          <ul>
            <li>경쟁력 있는 급여 및 성과급</li>
            <li>자사 제품 할인 혜택 (70% 할인)</li>
            <li>유연 근무제 및 재택근무 지원</li>
            <li>교육비 지원 및 컨퍼런스 참가비 지원</li>
            <li>건강검진 및 의료비 지원</li>
            <li>동호회 활동비 지원</li>
            <li>장기근속자 해외연수 기회</li>
          </ul>
        </section>

        <section>
          <h2>지원 방법</h2>
          <p>이력서와 자기소개서를 아래 이메일로 보내주시기 바랍니다.</p>
          <p>
            <strong>채용 담당:</strong> hr@ecommerce.com
          </p>
          <p>
            <strong>문의 전화:</strong> 1588-0000 (내선 200)
          </p>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              * 서류 전형 → 1차 면접 → 2차 면접 → 최종 합격
              <br />
              * 전형 결과는 개별적으로 안내드립니다
              <br />* 허위 기재 시 합격이 취소될 수 있습니다
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default CareersPage;
