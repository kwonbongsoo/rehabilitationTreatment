const PrivacyPage: React.FC = () => {
  return (
    <>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1>개인정보처리방침</h1>

        <section style={{ marginBottom: '2rem' }}>
          <h2>제1조(개인정보의 처리목적)</h2>
          <p>
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적
            이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법에 따라
            별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul>
            <li>회원 가입 및 관리</li>
            <li>상품 주문 및 배송</li>
            <li>고객 상담 및 서비스 제공</li>
            <li>마케팅 및 광고 활용</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>제2조(개인정보의 처리 및 보유기간)</h2>
          <p>
            회사는 법령에 따른 개인정보 보유사용기간 또는 정보주체로부터 개인정보를 수집 시에
            동의받은 개인정보 보유사용기간 내에서 개인정보를 처리보유합니다.
          </p>
          <ul>
            <li>회원정보: 회원 탈퇴 시까지</li>
            <li>주문정보: 주문 완료 후 5년</li>
            <li>결제정보: 결제 완료 후 5년</li>
            <li>상담기록: 상담 완료 후 3년</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>제3조(개인정보의 제3자 제공)</h2>
          <p>
            회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만
            처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는
            경우에만 개인정보를 제3자에게 제공합니다.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>제4조(정보주체의 권리·의무 및 행사방법)</h2>
          <p>
            정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수
            있습니다.
          </p>
          <ul>
            <li>개인정보 처리정지 요구</li>
            <li>개인정보 열람요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리정지 요구</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>제5조(개인정보의 안전성 확보조치)</h2>
          <p>
            회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및
            물리적 조치를 하고 있습니다.
          </p>
          <ul>
            <li>개인정보 취급 직원의 최소화 및 교육</li>
            <li>개인정보의 암호화</li>
            <li>해킹 등에 대비한 기술적 대책</li>
            <li>개인정보에 대한 접근 제한</li>
          </ul>
        </section>

        <section>
          <h2>개인정보 보호책임자</h2>
          <p>
            <strong>성명:</strong> 홍길동
          </p>
          <p>
            <strong>연락처:</strong> privacy@ecommerce.com
          </p>
          <p>
            <strong>전화:</strong> 1588-0000
          </p>

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
            시행일자: 2025년 1월 1일
          </p>
        </section>
      </div>
    </>
  );
};

export default PrivacyPage;
