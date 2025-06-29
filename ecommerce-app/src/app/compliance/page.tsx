'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function Compliance() {
  const [activeSection, setActiveSection] = useState('overview');

  const complianceAreas = [
    {
      id: 'overview',
      title: '컴플라이언스 개요',
      icon: '📋',
    },
    {
      id: 'data-protection',
      title: '개인정보보호',
      icon: '🔒',
    },
    {
      id: 'quality',
      title: '품질관리',
      icon: '✅',
    },
    {
      id: 'labor',
      title: '노동 윤리',
      icon: '⚖️',
    },
    {
      id: 'environment',
      title: '환경 보호',
      icon: '🌱',
    },
    {
      id: 'transparency',
      title: '투명성',
      icon: '🔍',
    },
  ];

  const certifications = [
    {
      name: 'ISO 27001',
      description: '정보보안 관리시스템 국제표준',
      issuer: '국제표준화기구',
      validUntil: '2025-12-31',
    },
    {
      name: 'PIMS',
      description: '개인정보보호 관리체계',
      issuer: '한국인터넷진흥원',
      validUntil: '2025-06-30',
    },
    {
      name: 'GOTS',
      description: '글로벌 오가닉 텍스타일 표준',
      issuer: 'Global Standard gGmbH',
      validUntil: '2025-03-15',
    },
    {
      name: 'Fair Trade',
      description: '공정무역 인증',
      issuer: 'Fairtrade International',
      validUntil: '2025-09-20',
    },
  ];

  const policies = [
    {
      title: '개인정보처리방침',
      description: '고객의 개인정보 수집, 이용, 제공에 관한 정책',
      lastUpdated: '2024-12-01',
      type: 'privacy',
    },
    {
      title: '공급업체 행동강령',
      description: '공급업체가 준수해야 할 윤리적 기준',
      lastUpdated: '2024-11-15',
      type: 'supplier',
    },
    {
      title: '품질보증정책',
      description: '제품 품질 관리 및 보증에 관한 정책',
      lastUpdated: '2024-10-30',
      type: 'quality',
    },
    {
      title: '환경보호정책',
      description: '지속가능한 비즈니스를 위한 환경보호 정책',
      lastUpdated: '2024-11-01',
      type: 'environment',
    },
  ];

  const auditResults = [
    {
      year: '2024',
      type: '내부감사',
      focus: '개인정보보호',
      result: '적합',
      recommendations: 3,
    },
    {
      year: '2024',
      type: '외부감사',
      focus: '품질관리시스템',
      result: '적합',
      recommendations: 1,
    },
    {
      year: '2023',
      type: '공급업체 감사',
      focus: '노동 윤리',
      result: '부분 적합',
      recommendations: 5,
    },
  ];

  return (
    <div className={styles.container}>
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
                  StyleShop은 모든 비즈니스 활동에서 최고 수준의 윤리적 기준을 유지하며, 관련 법규와
                  국제 표준을 철저히 준수합니다.
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
                  전담 컴플라이언스 팀을 운영하여 정기적인 모니터링과 교육을 실시하고, 내외부 감사를
                  통해 지속적인 개선을 추진합니다.
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
                <ul>
                  <li>최소한의 개인정보만 수집</li>
                  <li>수집 목적에 맞는 이용</li>
                  <li>안전한 보관 및 전송</li>
                  <li>투명한 처리 과정 공개</li>
                  <li>개인의 권리 보장</li>
                </ul>
              </div>
              <div className={styles.policies}>
                <h3>관련 정책</h3>
                {policies
                  .filter((p) => p.type === 'privacy')
                  .map((policy, index) => (
                    <div key={index} className={styles.policyCard}>
                      <h4>{policy.title}</h4>
                      <p>{policy.description}</p>
                      <span>최종 업데이트: {policy.lastUpdated}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 나머지 섹션들 */}
        {activeSection !== 'overview' && activeSection !== 'data-protection' && (
          <div className={styles.section}>
            <h2>{complianceAreas.find((area) => area.id === activeSection)?.title}</h2>
            <div className={styles.placeholder}>
              <p>이 섹션의 내용은 곧 업데이트될 예정입니다.</p>
              <p>자세한 정보가 필요하시면 고객센터로 문의해주세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
