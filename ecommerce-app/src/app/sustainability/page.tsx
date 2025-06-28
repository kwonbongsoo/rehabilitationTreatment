import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '지속가능성',
  description: '환경보호와 지속가능한 미래를 위한 우리의 노력을 소개합니다.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SustainabilityPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>지속가능성</h1>
      <section style={{ marginBottom: '2rem' }}>
        <h2>환경을 생각하는 쇼핑</h2>
        <p>
          우리는 지구환경을 보호하고 지속가능한 미래를 만들기 위해 다양한 노력을 기울이고 있습니다.
        </p>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2>친환경 포장재</h2>
        <ul>
          <li>재활용 가능한 포장재 사용</li>
          <li>플라스틱 사용량 최소화</li>
          <li>생분해성 포장재 도입</li>
        </ul>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2>탄소 중립 배송</h2>
        <ul>
          <li>효율적인 배송 루트 최적화</li>
          <li>친환경 배송 수단 도입</li>
          <li>탄소 상쇄 프로그램 참여</li>
        </ul>
      </section>
      <section>
        <h2>지속가능한 상품</h2>
        <p>친환경 소재로 만든 상품들을 우선적으로 선별하여 고객들에게 제공하고 있습니다.</p>
      </section>
    </div>
  );
}
