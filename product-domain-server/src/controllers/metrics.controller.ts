import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

// NestJS 메트릭 시스템 import
const { client } = require('/app/monitoring/nestjs-metrics.js');

@Controller()
export class MetricsController {
  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    try {
      // Prometheus 클라이언트에서 수집된 모든 메트릭 반환
      const metrics = await client.register.metrics();
      
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      return res.send(metrics);
    } catch (error) {
      console.error('Failed to collect product server metrics:', error);
      
      // 폴백: 기본 상태 메트릭만 제공
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      const fallbackMetrics = `# HELP product_server_status Product server status
# TYPE product_server_status gauge
product_server_status{service="product-domain-server"} 1

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds{service="product-domain-server"} ${uptime}

# HELP process_memory_rss_bytes Resident memory size in bytes
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes{service="product-domain-server"} ${memoryUsage.rss}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}",service="product-domain-server"} 1

# Error collecting full metrics
# ${error instanceof Error ? error.message : 'Unknown error'}
`;

      res.set('Content-Type', 'text/plain; charset=utf-8');
      return res.send(fallbackMetrics);
    }
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'product-domain-server',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
