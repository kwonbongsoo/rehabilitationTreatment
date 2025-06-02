import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <h1>이용약관</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>제1조(목적)</h2>
                    <p>
                        이 약관은 회사가 운영하는 인터넷쇼핑몰에서 제공하는 인터넷관련서비스
                        (이하 "서비스"라 한다)를 이용함에 있어 사이버몰과 이용자의 권리·의무 및
                        책임사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>제2조(정의)</h2>
                    <ul>
                        <li>"쇼핑몰"이란 회사가 상품 또는 서비스를 이용자에게 제공하기 위하여 컴퓨터등정보통신설비를 이용하여 상품 또는 서비스를 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
                        <li>"이용자"란 "쇼핑몰"에 접속하여 이 약관에 따라 "쇼핑몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                        <li>"회원"이란 "쇼핑몰"에 회원등록을 한 자로서, 계속적으로 "쇼핑몰"이 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>제3조(약관등의 명시와 설명 및 개정)</h2>
                    <p>
                        "쇼핑몰"은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소,
                        전화번호, 모사전송번호, 전자우편주소, 사업자등록번호, 통신판매업신고번호,
                        개인정보보호책임자등을 이용자가 쉽게 알 수 있도록 사이의 초기 서비스화면에 게시합니다.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>제4조(서비스의 제공 및 변경)</h2>
                    <ul>
                        <li>상품 또는 서비스에 관한 정보 제공 및 구매계약의 체결</li>
                        <li>구매계약이 체결된 상품 또는 서비스의 배송</li>
                        <li>기타 "쇼핑몰"이 정하는 업무</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>제5조(서비스의 중단)</h2>
                    <p>
                        "쇼핑몰"은 컴퓨터등정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
                        서비스의 제공을 일시적으로 중단할 수 있습니다.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>제6조(회원가입)</h2>
                    <p>
                        이용자는 "쇼핑몰"이 정한 가입양식에 따라 회원정보를 기입한 후
                        이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
                    </p>
                </section>

                <section>
                    <h2>고객센터</h2>
                    <p><strong>전화:</strong> 1588-0000</p>
                    <p><strong>이메일:</strong> support@ecommerce.com</p>
                    <p><strong>운영시간:</strong> 평일 09:00 - 18:00</p>

                    <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
                        시행일자: 2025년 1월 1일
                    </p>
                </section>
            </div>
        </>
    );
};

export default TermsPage;

