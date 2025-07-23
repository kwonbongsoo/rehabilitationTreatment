import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { NextResponse } from 'next/server';

interface PerformanceStats {
  count: number;
  average: number;
  min: number;
  max: number;
  median: number;
}

interface TestResults {
  fileIO: number[];
  networkIO: number[];
  renderingEngine: number[];
}

interface PerformanceAnalysis {
  fileIOFaster: boolean;
  performanceDifference: {
    fileVsNetwork?: string;
    renderingVsFile?: string;
    renderingVsNetwork?: string;
  };
}

interface ApiResponse {
  success: boolean;
  timestamp: string;
  testConfig: {
    iterations: number;
    environment: string | undefined;
    router: string;
  };
  results: {
    fileIO: PerformanceStats;
    networkIO: PerformanceStats;
    renderingEngine: PerformanceStats;
  };
  analysis: PerformanceAnalysis;
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  const testResults: TestResults = {
    fileIO: [],
    networkIO: [],
    renderingEngine: [],
  };

  const iterations = 100;

  // 1. 파일 IO 성능 측정
  console.log('🔥 파일 IO 성능 측정 시작...');

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      // App Router에서 빌드 파일 경로
      const filePath = path.join(process.cwd(), '.next/static/chunks/app/page.js');
      const fileContent = await fs.readFile(filePath, 'utf8');

      const endTime = performance.now();
      const duration = endTime - startTime;

      testResults.fileIO.push(duration);

      if (i === 0) {
        console.log(`📁 파일 크기: ${Buffer.byteLength(fileContent, 'utf8')} bytes`);
      }
    } catch (error) {
      console.error(
        `파일 IO 에러 (${i}번째):`,
        error instanceof Error ? error.message : 'Unknown error',
      );

      // 파일이 없을 경우 대체 파일 시도
      try {
        const fallbackPath = path.join(process.cwd(), 'package.json');
        const fallbackContent = await fs.readFile(fallbackPath, 'utf8');
        const endTime = performance.now();
        testResults.fileIO.push(endTime - startTime);
      } catch (fallbackError) {
        console.error(
          '대체 파일도 실패:',
          fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
        );
      }
    }
  }

  // 2. 네트워크 IO 성능 측정
  console.log('🌐 네트워크 IO 성능 측정 시작...');

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      // 실제 CDN 또는 공개 API 호출
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        headers: {
          'User-Agent': 'Next.js App Router Performance Test',
        },
      });

      const content = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;

      testResults.networkIO.push(duration);

      if (i === 0) {
        console.log(`🌐 네트워크 응답 크기: ${JSON.stringify(content).length} bytes`);
        console.log(`🌐 응답 상태: ${response.status}`);
      }
    } catch (error) {
      console.error(
        `네트워크 IO 에러 (${i}번째):`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // 3. 렌더링 엔진 성능 측정 (App Router에서)
  console.log('⚡ 렌더링 엔진 성능 측정 시작...');

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      // React 18 Server Components 렌더링 시뮬레이션
      const { renderToString } = await import('react-dom/server');
      const React = await import('react');

      // 복잡한 서버 컴포넌트 시뮬레이션
      const ComplexServerComponent = React.createElement(
        'div',
        {
          className: 'server-component',
        },
        Array.from({ length: 1000 }, (_, idx) =>
          React.createElement(
            'article',
            { key: idx },
            React.createElement('h3', null, `제목 ${idx}`),
            React.createElement('p', null, `내용 ${idx} - 서버에서 렌더링됨`),
          ),
        ),
      );

      const { view } = renderToString(ComplexServerComponent);

      const endTime = performance.now();
      const duration = endTime - startTime;

      testResults.renderingEngine.push(duration);

      if (i === 0) {
        console.log(`⚡ 렌더링된 HTML 크기: ${Buffer.byteLength(view, 'utf8')} bytes`);
      }
    } catch (error) {
      console.error(
        `렌더링 엔진 에러 (${i}번째):`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // 결과 분석 함수
  const calculateStats = (measurements: number[]): PerformanceStats => {
    const validMeasurements = measurements.filter((m) => m > 0);
    if (validMeasurements.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, median: 0 };
    }

    const sum = validMeasurements.reduce((a, b) => a + b, 0);
    const avg = sum / validMeasurements.length;
    const min = Math.min(...validMeasurements);
    const max = Math.max(...validMeasurements);
    const sortedMeasurements = [...validMeasurements].sort((a, b) => a - b);
    const median = sortedMeasurements[Math.floor(sortedMeasurements.length / 2)];

    return {
      count: validMeasurements.length,
      average: parseFloat(avg.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      median: parseFloat(median?.toFixed(2) ?? '0'),
    };
  };

  const fileIOStats = calculateStats(testResults.fileIO);
  const networkIOStats = calculateStats(testResults.networkIO);
  const renderingStats = calculateStats(testResults.renderingEngine);

  // 콘솔 출력
  console.log('\n📊 === App Router 성능 측정 결과 ===');
  console.log('📁 파일 IO 성능:', fileIOStats);
  console.log('🌐 네트워크 IO 성능:', networkIOStats);
  console.log('⚡ 렌더링 엔진 성능:', renderingStats);

  // 성능 비교 분석
  const fileIOAvg = fileIOStats.average;
  const networkIOAvg = networkIOStats.average;
  const renderingAvg = renderingStats.average;

  const analysis: PerformanceAnalysis = {
    fileIOFaster: fileIOAvg < networkIOAvg,
    performanceDifference: {},
  };

  if (fileIOAvg > 0 && networkIOAvg > 0) {
    const diff = Math.abs(((fileIOAvg - networkIOAvg) / Math.min(fileIOAvg, networkIOAvg)) * 100);
    analysis.performanceDifference.fileVsNetwork = `${diff.toFixed(1)}%`;

    if (fileIOAvg < networkIOAvg) {
      console.log(`✅ 파일 IO가 네트워크 IO보다 ${diff.toFixed(1)}% 빠름`);
    } else {
      console.log(`❌ 네트워크 IO가 파일 IO보다 ${diff.toFixed(1)}% 빠름`);
    }
  }

  if (renderingAvg > 0 && fileIOAvg > 0) {
    const renderingVsFile = ((renderingAvg - fileIOAvg) / fileIOAvg) * 100;
    analysis.performanceDifference.renderingVsFile = `${renderingVsFile.toFixed(1)}%`;
    console.log(`🎯 렌더링 엔진은 파일 IO보다 ${renderingVsFile.toFixed(1)}% 더 오래 걸림`);
  }

  if (renderingAvg > 0 && networkIOAvg > 0) {
    const renderingVsNetwork = ((renderingAvg - networkIOAvg) / networkIOAvg) * 100;
    analysis.performanceDifference.renderingVsNetwork = `${renderingVsNetwork.toFixed(1)}%`;
    console.log(`🎯 렌더링 엔진은 네트워크 IO보다 ${renderingVsNetwork.toFixed(1)}% 더 오래 걸림`);
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    testConfig: {
      iterations,
      environment: process.env.NODE_ENV,
      router: 'app',
    },
    results: {
      fileIO: fileIOStats,
      networkIO: networkIOStats,
      renderingEngine: renderingStats,
    },
    analysis,
  });
}
