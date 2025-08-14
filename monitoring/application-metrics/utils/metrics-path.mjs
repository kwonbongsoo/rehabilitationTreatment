/**
 * 메트릭 파일 경로 해결 유틸리티
 * 로컬과 Docker 환경 모두에서 동작하도록 동적 경로 제공
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 환경에 따른 메트릭 파일 기본 경로 반환
 * @returns {string} 메트릭 파일들이 있는 기본 경로
 */
export function getMetricsBasePath() {
  // 환경변수로 명시적 경로 지정된 경우
  if (process.env.METRICS_PATH) {
    return process.env.METRICS_PATH;
  }

  // Docker 환경 감지 (/.dockerenv 파일 존재 또는 DOCKER_ENV 환경변수)
  const isDocker = existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true';
  
  if (isDocker) {
    // Docker 환경: /app/monitoring
    return '/app/monitoring';
  } else {
    // 로컬 환경: 현재 디렉토리 기준 상대 경로
    return resolve(__dirname, '..');
  }
}

/**
 * 특정 메트릭 파일의 절대 경로 반환
 * @param {string} filename - 메트릭 파일명 (예: 'fastify-metrics.mjs')
 * @returns {string} 절대 경로
 */
export function getMetricsFilePath(filename) {
  const basePath = getMetricsBasePath();
  return join(basePath, filename);
}

/**
 * 환경 정보 출력 (디버깅용)
 * @returns {object} 환경 정보 객체
 */
export function getEnvironmentInfo() {
  const isDocker = existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true';
  const basePath = getMetricsBasePath();
  
  return {
    isDocker,
    basePath,
    nodeEnv: process.env.NODE_ENV || 'development',
    metricsPathEnv: process.env.METRICS_PATH || 'not set'
  };
}

// 디버깅을 위한 환경 정보 로깅 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Metrics Path Environment Info:', getEnvironmentInfo());
}