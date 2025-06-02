import React, { useState } from 'react';
import Head from 'next/head';
import styles from './Compliance.module.css';

const Compliance: React.FC = () => {
    const [activeSection, setActiveSection] = useState('overview');

    const complianceAreas = [
        {
            id: 'overview',
            title: '컴플라이언스 개요',
            icon: '📋'
        },
        {
            id: 'data-protection',
            title: '개인정보보호',
            icon: '🔒'
        },
        {
            id: 'quality',
            title: '품질관리',
            icon: '✅'
        },
        {
            id: 'labor',
            title: '노동 윤리',
            icon: '⚖️'
        },
        {
            id: 'environment',
            title: '환경 보호',
            icon: '🌱'
        },
        {
            id: 'transparency',
            title: '투명성',
            icon: '🔍'
        }
    ];

    const certifications = [
        {
            name: 'ISO 27001',
            description: '정보보안 관리시스템 국제표준',
            issuer: '국제표준화기구',
            validUntil: '2025-12-31'
        },
        {
            name: 'PIMS',
            description: '개인정보보호 관리체계',
            issuer: '한국인터넷진흥원',
            validUntil: '2025-06-30'
        },
        {
            name: 'GOTS',
            description: '글로벌 오가닉 텍스타일 표준',
            issuer: 'Global Standard gGmbH',
            validUntil: '2025-03-15'
        },
        {
            name: 'Fair Trade',
            description: '공정무역 인증',
            issuer: 'Fairtrade International',
            validUntil: '2025-09-20'
        }
    ];

    const policies = [
        {
            title: '개인정보처리방침',
            description: '고객의 개인정보 수집, 이용, 제공에 관한 정책',
            lastUpdated: '2024-12-01',
            type: 'privacy'
        },
        {
            title: '공급업체 행동강령',
            description: '공급업체가 준수해야 할 윤리적 기준',
            lastUpdated: '2024-11-15',
            type: 'supplier'
        },
        {
            title: '품질보증정책',
            description: '제품 품질 관리 및 보증에 관한 정책',
            lastUpdated: '2024-10-30',
            type: 'quality'
        },
        {
            title: '환경보호정책',
            description: '지속가능한 비즈니스를 위한 환경보호 정책',
            lastUpdated: '2024-11-01',
            type: 'environment'
        }
    ];

    const auditResults = [
        {
            year: '2024',
            type: '내부감사',
            focus: '개인정보보호',
            result: '적합',
            recommendations: 3
        },
        {
            year: '2024',
            type: '외부감사',
            focus: '품질관리시스템',
            result: '적합',
            recommendations: 1
        },
        {
            year: '2023',
            type: '공급업체 감사',
            focus: '노동 윤리',
            result: '부분 적합',
            recommendations: 5
        }
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>컴플라이언스 - StyleShop</title>
                <meta name="description" content="StyleShop의 컴플라이언스 정책과 인증 현황을 확인하세요." />
            </Head>

            <div className={styles.header}>
                <h1>컴플라이언스</h1>
                <p>윤리적이고 투명한 비즈니스 운영을 통해 신뢰받는 기업이 되겠습니다.</p>
            </div>

            <div className={styles.navigation}>
                {complianceAreas.map((area) => (
                    <button
                        key={area.id}
                        className={`${styles.navButton} ${activeSection === area.id ? styles.active : ''}`}
                        onClick={() => setActiveSection(area.id)}
                    >
                        <span className={styles.navIcon}>{area.icon}</span>
                        <span>{area.title}</span>
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <h2>컴플라이언스 개요</h2>
                        <div className={styles.overviewGrid}>
                            <div className={styles.overviewCard}>
                                <h3>우리의 약속</h3>
                                <p>
                                    StyleShop은 모든 비즈니스 활동에서 최고 수준의 윤리적 기준을 유지하며,
                                    관련 법규와 국제 표준을 철저히 준수합니다.
                                </p>
                            </div>
                            <div className={styles.overviewCard}>
                                <h3>핵심 가치</h3>
                                <ul>
                                    <li>투명성과 정직</li>
                                    <li>고객 개인정보 보호</li>
                                    <li>제품 품질과 안전</li>
                                    <li>공정한 노동 환경</li>
                                    <li>환경 보호와 지속가능성</li>
                                </ul>
                            </div>
                            <div className={styles.overviewCard}>
                                <h3>관리 체계</h3>
                                <p>
                                    전담 컴플라이언스 팀을 운영하여 정기적인 모니터링과 교육을 실시하고,
                                    내외부 감사를 통해 지속적인 개선을 추진합니다.
                                </p>
                            </div>
                        </div>

                        <div className={styles.certificationSection}>
                            <h3>보유 인증</h3>
                            <div className={styles.certificationGrid}>
                                {certifications.map((cert, index) => (
                                    <div key={index} className={styles.certCard}>
                                        <h4>{cert.name}</h4>
                                        <p>{cert.description}</p>
                                        <div className={styles.certDetails}>
                                            <span>발급기관: {cert.issuer}</span>
                                            <span>유효기간: {cert.validUntil}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'data-protection' && (
                    <div className={styles.section}>
                        <h2>개인정보보호</h2>
                        <div className={styles.dataProtectionContent}>
                            <div className={styles.protectionPrinciples}>
                                <h3>개인정보보호 원칙</h3>
                                <div className={styles.principlesList}>
                                    <div className={styles.principleItem}>
                                        <h4>최소 수집</h4>
                                        <p>서비스 제공에 필요한 최소한의 개인정보만 수집합니다.</p>
                                    </div>
                                    <div className={styles.principleItem}>
                                        <h4>목적 제한</h4>
                                        <p>수집 목적 범위 내에서만 개인정보를 이용합니다.</p>
                                    </div>
                                    <div className={styles.principleItem}>
                                        <h4>안전한 보관</h4>
                                        <p>암호화 등 기술적 조치로 개인정보를 안전하게 보관합니다.</p>
                                    </div>
                                    <div className={styles.principleItem}>
                                        <h4>권리 보장</h4>
                                        <p>개인정보 열람, 정정, 삭제 요구권을 보장합니다.</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.securityMeasures}>
                                <h3>보안 조치</h3>
                                <ul>
                                    <li>개인정보 암호화 저장 및 전송</li>
                                    <li>접근 권한 관리 시스템 운영</li>
                                    <li>정기적인 보안 점검 및 취약점 진단</li>
                                    <li>개인정보보호 교육 실시</li>
                                    <li>개인정보 처리 로그 관리</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'quality' && (
                    <div className={styles.section}>
                        <h2>품질관리</h2>
                        <div className={styles.qualityContent}>
                            <div className={styles.qualityStandards}>
                                <h3>품질 기준</h3>
                                <div className={styles.standardsList}>
                                    <div className={styles.standardItem}>
                                        <h4>원료 검사</h4>
                                        <p>모든 원료에 대한 품질 검사 및 안전성 확인</p>
                                    </div>
                                    <div className={styles.standardItem}>
                                        <h4>제조 과정</h4>
                                        <p>제조 공정별 품질 관리 및 검수</p>
                                    </div>
                                    <div className={styles.standardItem}>
                                        <h4>완제품 검사</h4>
                                        <p>출하 전 최종 품질 검사 및 승인</p>
                                    </div>
                                    <div className={styles.standardItem}>
                                        <h4>지속적 개선</h4>
                                        <p>고객 피드백 반영 및 품질 개선</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.testingLabs}>
                                <h3>검사 기관</h3>
                                <ul>
                                    <li>한국의류시험연구원 (KATRI)</li>
                                    <li>한국화학융합시험연구원 (KTR)</li>
                                    <li>SGS 코리아</li>
                                    <li>인터텍 코리아</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'labor' && (
                    <div className={styles.section}>
                        <h2>노동 윤리</h2>
                        <div className={styles.laborContent}>
                            <div className={styles.laborStandards}>
                                <h3>노동 기준</h3>
                                <div className={styles.standardsList}>
                                    <div className={styles.standardItem}>
                                        <h4>공정한 임금</h4>
                                        <p>현지 최저임금 이상의 생활임금 보장</p>
                                    </div>
                                    <div className={styles.standardItem}>
                                        <h4>안전한 작업환경</h4>
                                        <p>작업장 안전 기준 준수 및 보호장비 제공</p>
                                    </div>
                                    <div className={styles.standardItem}>
                                        <h4>아동노동 금지</h4>
                                        <p>18세 미만 아동노동 엄격 금지</p>
                                    </div>
                                    <div className={styles.standardItem}>
                                        <h4>결사의 자유</h4>
                                        <p>노동조합 가입 및 단체교섭권 보장</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.supplierMonitoring}>
                                <h3>공급업체 관리</h3>
                                <ul>
                                    <li>정기적인 공급업체 감사 실시</li>
                                    <li>노동 기준 준수 서약서 징구</li>
                                    <li>개선 계획 수립 및 이행 점검</li>
                                    <li>근로자 고충 처리 시스템 운영</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'environment' && (
                    <div className={styles.section}>
                        <h2>환경 보호</h2>
                        <div className={styles.environmentContent}>
                            <div className={styles.environmentGoals}>
                                <h3>환경 목표</h3>
                                <div className={styles.goalsList}>
                                    <div className={styles.goalItem}>
                                        <h4>탄소 중립</h4>
                                        <p>2030년까지 탄소 중립 달성</p>
                                    </div>
                                    <div className={styles.goalItem}>
                                        <h4>친환경 소재</h4>
                                        <p>재활용 및 유기농 소재 사용 확대</p>
                                    </div>
                                    <div className={styles.goalItem}>
                                        <h4>포장재 개선</h4>
                                        <p>플라스틱 포장재 사용 최소화</p>
                                    </div>
                                    <div className={styles.goalItem}>
                                        <h4>물 사용 절약</h4>
                                        <p>제조 과정 물 사용량 30% 절감</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.initiatives}>
                                <h3>추진 현황</h3>
                                <ul>
                                    <li>재생에너지 사용률: 65% (2024년 기준)</li>
                                    <li>친환경 소재 제품 비율: 40%</li>
                                    <li>재활용 포장재 사용률: 80%</li>
                                    <li>탄소 배출량 전년 대비 15% 감소</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'transparency' && (
                    <div className={styles.section}>
                        <h2>투명성</h2>
                        <div className={styles.transparencyContent}>
                            <div className={styles.reportingSection}>
                                <h3>공시 및 보고</h3>
                                <div className={styles.policyGrid}>
                                    {policies.map((policy, index) => (
                                        <div key={index} className={styles.policyCard}>
                                            <h4>{policy.title}</h4>
                                            <p>{policy.description}</p>
                                            <div className={styles.policyMeta}>
                                                <span>최종 업데이트: {policy.lastUpdated}</span>
                                                <button className={styles.downloadButton}>다운로드</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.auditSection}>
                                <h3>감사 결과</h3>
                                <div className={styles.auditTable}>
                                    <div className={styles.auditHeader}>
                                        <div>연도</div>
                                        <div>유형</div>
                                        <div>대상</div>
                                        <div>결과</div>
                                        <div>권고사항</div>
                                    </div>
                                    {auditResults.map((audit, index) => (
                                        <div key={index} className={styles.auditRow}>
                                            <div>{audit.year}</div>
                                            <div>{audit.type}</div>
                                            <div>{audit.focus}</div>
                                            <div className={audit.result === '적합' ? styles.passed : styles.partial}>
                                                {audit.result}
                                            </div>
                                            <div>{audit.recommendations}건</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.contactSection}>
                <h3>컴플라이언스 문의</h3>
                <p>컴플라이언스 관련 문의사항이나 제보가 있으시면 연락해주세요.</p>
                <div className={styles.contactInfo}>
                    <div>
                        <strong>컴플라이언스 팀</strong>
                        <p>compliance@styleshop.com</p>
                    </div>
                    <div>
                        <strong>신고센터</strong>
                        <p>ethics@styleshop.com</p>
                    </div>
                    <div>
                        <strong>전화</strong>
                        <p>1588-1234 (내선 2번)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compliance;
