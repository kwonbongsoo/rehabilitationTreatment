import React from 'react';

const PressPage: React.FC = () => {
    return (
        <>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <h1>보도자료</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>언론 보도</h2>
                    <p>
                        우리 회사의 최신 소식과 성과를 다룬 언론 보도 자료들을 확인하실 수 있습니다.
                    </p>
                </section>

                <div style={{ marginBottom: '2rem' }}>
                    <article style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px' }}>
                        <h3>친환경 패션 라인 출시, 지속가능한 패션 선도</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>2024.12.15 | 패션비즈니스</p>
                        <p>
                            당사가 새롭게 선보이는 친환경 패션 라인이 업계의 주목을 받고 있다.
                            재활용 소재를 활용한 이번 컬렉션은 패션과 환경의 조화를 추구하며...
                        </p>
                        <a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>자세히 보기 →</a>
                    </article>

                    <article style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px' }}>
                        <h3>2024년 매출 전년 대비 150% 성장 달성</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>2024.11.20 | 이코노미스트</p>
                        <p>
                            올해 온라인 쇼핑몰의 매출이 전년 동기 대비 150% 성장을 기록했다고 발표했다.
                            특히 MZ세대를 타겟으로 한 마케팅 전략이 주효했다는 평가를 받고 있다...
                        </p>
                        <a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>자세히 보기 →</a>
                    </article>

                    <article style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px' }}>
                        <h3>해외 진출 본격화, 동남아시아 시장 공략</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>2024.10.08 | 머니투데이</p>
                        <p>
                            국내 온라인 패션 시장에서 입지를 굳힌 당사가 해외 진출에 본격 나선다.
                            첫 번째 타겟은 동남아시아 시장으로, 현지 파트너와의 협력을 통해...
                        </p>
                        <a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>자세히 보기 →</a>
                    </article>

                    <article style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px' }}>
                        <h3>AI 기반 개인 맞춤 추천 시스템 도입</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>2024.09.15 | 디지털타임스</p>
                        <p>
                            인공지능 기술을 활용한 개인 맞춤형 상품 추천 시스템을 도입했다고 발표했다.
                            고객의 구매 패턴과 선호도를 분석하여 최적화된 상품을 추천하는...
                        </p>
                        <a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>자세히 보기 →</a>
                    </article>
                </div>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>수상 내역</h2>
                    <ul>
                        <li><strong>2024년:</strong> 대한민국 e-커머스 대상 '올해의 패션 쇼핑몰' 수상</li>
                        <li><strong>2023년:</strong> 지속가능경영 우수기업 인증</li>
                        <li><strong>2023년:</strong> 소비자가 뽑은 최고의 온라인 쇼핑몰 1위</li>
                        <li><strong>2022년:</strong> 벤처기업 혁신상 수상</li>
                    </ul>
                </section>

                <section>
                    <h2>미디어 키트</h2>
                    <p>언론 관계자분들을 위한 자료입니다.</p>
                    <ul>
                        <li><a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>회사 로고 다운로드</a></li>
                        <li><a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>대표 이미지 팩</a></li>
                        <li><a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>회사 소개서 (PDF)</a></li>
                        <li><a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>최신 실적 자료</a></li>
                    </ul>

                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <h3>보도 문의</h3>
                        <p><strong>담당자:</strong> 홍보팀 김미디어</p>
                        <p><strong>이메일:</strong> press@ecommerce.com</p>
                        <p><strong>전화:</strong> 1588-0000 (내선 300)</p>
                    </div>
                </section>
            </div>
        </>
    );
};

export default PressPage;
