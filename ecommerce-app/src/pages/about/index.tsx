import styles from './About.module.css';

const AboutPage: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>회사 소개</h1>
          <p className={styles.subtitle}>고객의 라이프스타일을 완성하는 프리미엄 패션 브랜드</p>
        </div>

        <section className={styles.section}>
          <h2>우리의 비전</h2>
          <p>
            우리는 모든 고객이 자신만의 독특한 스타일을 표현할 수 있도록 최고 품질의 패션 아이템을
            제공합니다. 지속가능한 패션을 통해 더 나은 미래를 만들어갑니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>회사 연혁</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <h3>2020년</h3>
              <p>회사 설립, 온라인 쇼핑몰 런칭</p>
            </div>
            <div className={styles.timelineItem}>
              <h3>2021년</h3>
              <p>첫 번째 오프라인 매장 오픈 (강남점)</p>
            </div>
            <div className={styles.timelineItem}>
              <h3>2022년</h3>
              <p>친환경 라인 출시, 지속가능성 프로그램 시작</p>
            </div>
            <div className={styles.timelineItem}>
              <h3>2023년</h3>
              <p>전국 10개 매장 확장</p>
            </div>
            <div className={styles.timelineItem}>
              <h3>2024년</h3>
              <p>해외 진출 시작</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>우리의 가치</h2>
          <div className={styles.values}>
            <div className={styles.valueItem}>
              <h3>품질</h3>
              <p>최고 품질의 소재와 정교한 제작 과정을 통해 오래도록 사랑받는 제품을 만듭니다.</p>
            </div>
            <div className={styles.valueItem}>
              <h3>지속가능성</h3>
              <p>환경을 생각하는 소재 선택과 제작 과정으로 지구를 보호합니다.</p>
            </div>
            <div className={styles.valueItem}>
              <h3>고객 중심</h3>
              <p>고객의 니즈를 최우선으로 생각하며 최상의 쇼핑 경험을 제공합니다.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>팀 소개</h2>
          <p>
            패션에 대한 열정과 전문성을 가진 다양한 분야의 전문가들이 함께 일하고 있습니다.
            디자이너, 바이어, 마케터, 개발자 등 각 분야의 최고 인재들이 모여 최상의 서비스를
            제공합니다.
          </p>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
