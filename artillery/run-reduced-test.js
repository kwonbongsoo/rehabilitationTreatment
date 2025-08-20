#!/usr/bin/env node

/**
 * 감소된 강도의 캐시 테스트 실행 스크립트
 * 프록시 서버가 터지지 않게 점진적으로 테스트
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const testConfigs = {
  minimal: {
    file: 'scenarios/minimal-cache-test.yml',
    description: '최소 강도 테스트 (1-5 req/s)',
    maxLoad: '5 req/s'
  },
  reduced: {
    file: 'scenarios/reduced-cache-test.yml', 
    description: '감소된 강도 테스트 (2-25 req/s)',
    maxLoad: '25 req/s'
  }
};

async function runTest(configName) {
  const config = testConfigs[configName];
  
  if (!config) {
    console.error(`❌ 알 수 없는 테스트 설정: ${configName}`);
    console.log('사용 가능한 설정:', Object.keys(testConfigs).join(', '));
    process.exit(1);
  }

  const configPath = path.join(__dirname, config.file);
  
  if (!fs.existsSync(configPath)) {
    console.error(`❌ 설정 파일을 찾을 수 없습니다: ${configPath}`);
    process.exit(1);
  }

  console.log(`\n🚀 ${config.description} 시작`);
  console.log(`📂 설정 파일: ${config.file}`);
  console.log(`⚡ 최대 부하: ${config.maxLoad}`);
  console.log(`🎯 대상: http://localhost:9000`);
  console.log('=' .repeat(60));

  return new Promise((resolve, reject) => {
    const artillery = spawn('npx', ['artillery', 'run', configPath], {
      stdio: 'inherit',
      shell: true
    });

    artillery.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${config.description} 완료`);
        resolve();
      } else {
        console.error(`\n❌ ${config.description} 실패 (코드: ${code})`);
        reject(new Error(`테스트 실패: ${code}`));
      }
    });

    artillery.on('error', (error) => {
      console.error(`\n❌ 테스트 실행 중 오류:`, error.message);
      reject(error);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'minimal';

  console.log(`\n🔥 Artillery 캐시 테스트 실행기`);
  console.log(`📊 Redis 캐시 프록시 성능 테스트`);
  
  try {
    await runTest(testType);
    
    console.log(`\n📈 테스트 결과:`);
    console.log(`   - 실시간 캐시 메트릭이 콘솔에 표시되었습니다`);
    console.log(`   - 상세한 성능 리포트가 reports/ 폴더에 저장되었습니다`);
    console.log(`\n💡 다음 단계:`);
    console.log(`   1. 캐시 히트율과 응답시간을 확인하세요`);
    console.log(`   2. Redis 성능 메트릭을 분석하세요`);
    console.log(`   3. 필요시 더 높은 강도로 테스트하세요`);
    
  } catch (error) {
    console.error('\n💥 테스트 실행 실패:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, testConfigs };